import { Injectable } from '@angular/core';
import { Subject ,  Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { EidaService } from './eida.service';
import { EventsService } from './events.service';
import { 
  FdsnNetwork, FdsnStation, FdsnStationExt, StationsModel
} from './modules/models';
import { environment } from '../environments/environment';
import { Enums } from './modules/enums';
import { GisHelper } from './helpers/gis.helper';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class StationsService {
  public allNetworks: FdsnNetwork[];
  public allStations = new Array<FdsnStationExt>();
  public selectedStations = new Subject<FdsnStationExt[]>();
  public focuedStation = new Subject<FdsnStationExt>();
  private _mapStations = new Array<FdsnStationExt>();
  private _filteredStations = new Array<FdsnStationExt>();

  constructor(
    private _eidaService: EidaService,
    private _eventsService: EventsService
  ) { }

  private networksUrl = environment.networksUrl;
  private stationsUrl = environment.stationsUrl;
  private channelsUrl = environment.channelsUrl;
  private networksStationsUrl = environment.networksStationsUrl;

  addAllStations(fs: FdsnStation[]) {
    for (let f of fs) {
      let tmp = new FdsnStationExt();
      tmp.net = f.net;
      tmp.stat = f.stat;
      tmp.lat = f.lat;
      tmp.lon = f.lon;
      tmp.elev = f.elev;
      tmp.name = f.name;
      tmp.start = f.start;
      tmp.end = f.end;
      tmp.selected = true;
      this.allStations.push(tmp);
    }
  }

  // Add filtered stations to the working set and skip the duplicates
  updateStations(filteredStations: FdsnStationExt[]) {
    for (let fs of filteredStations) {
      if (this._mapStations.filter(
        e => (e.net === fs.net && e.stat === fs.stat)).length === 0) {
          this._mapStations.push(fs);
      }
    }
    this.selectedStations.next(this._mapStations);
  }

  refreshStations(mapStations: FdsnStationExt[]) {
    this.selectedStations.next(mapStations);
  }

  updateFocusedStation(s: FdsnStationExt) {
    this.focuedStation.next(s);
  }

  getNetworks(): Observable<FdsnNetwork[]> {
    return this._eidaService.http.get<FdsnNetwork[]>(this.networksUrl).pipe(
        tap(_ => this._eidaService.log('fetched networks data')),
        catchError(this._eidaService.handleError('getNetworks', []))
      );
  }

  getStations(): Observable<FdsnStation[]> {
    return this._eidaService.http.get<FdsnStation[]>(this.stationsUrl).pipe(
        tap(_ => this._eidaService.log('fetched stations data')),
        catchError(this._eidaService.handleError('getStations', []))
      );
  }

  getAvailableStreams(net: string, stat: string): Observable<Object> {
    let url = `${this.channelsUrl}?level=0&`;

    if (net) {
      url += `net=${net}&`;
    }

    if (stat) {
      url += `stat=${stat}`;
    }

    return this._eidaService.http.get<Object>(url).pipe(
      tap(_ => this._eidaService.log(`fetched streams data: ${net}/${stat}`)),
      catchError(this._eidaService.handleError('getAvailableStreams', []))
    );
  }

  getStreamsForWorkingSet(st: FdsnStationExt[]) {
    let url = `${this.channelsUrl}?level=0&`;
    return this._eidaService.http.post(
      url,
      JSON.stringify(st),
      {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }
    ).pipe(
      tap(_ => this._eidaService.log('fetched workset streams data')),
      catchError(this._eidaService.handleError('getStreamsForWorkingSet', []))
    );
  }

  // Add selected station(s) to map and notify subscribers
  addSelectedStation(sm: StationsModel) {
    if (sm.dataSource === Enums.StationDataSource.Inventory) {
      // Inventory based search

      // All all networks or selected network based on the combo selection
      if (sm.selectedNetwork === 'All') {
        this._filteredStations = this.allStations.filter(m => m.net);
      } else {
        this._filteredStations = this._mapStations.concat(this.allStations.filter(
          m => m.net === sm.selectedNetwork.code
        ))
      }

      // Station selection method-dependent
      if (sm.stationSelectionMethod === Enums.StationSelectionMethod.Code) {
        if (sm.selectedStation !== 'All') {
          this._filteredStations = this._filteredStations.filter(
            m => m.stat === sm.selectedStation.stat
          )
        }
      } else if (sm.stationSelectionMethod === Enums.StationSelectionMethod.Region) {
        this._filteredStations = this._filteredStations.filter(
          m => m.lat >= sm.coordinateS
          && m.lat <= sm.coordinateN
          && m.lon >= sm.coordinateW
          && m.lon <= sm.coordinateE
        )
      } else if (sm.stationSelectionMethod === Enums.StationSelectionMethod.Events) {
        for (let i = this._filteredStations.length - 1; i >= 0; i--) {
          if (!this._stationHasEvent(this._filteredStations[i], sm)) {
            this._filteredStations.splice(i, 1);
          }
        }
      }


    } else if (sm.dataSource === Enums.StationDataSource.File) {
      // TODO: uploaded file containing station catalog
    }

    this.updateStations(this._filteredStations);    
  }

  _stationHasEvent(s: FdsnStationExt, sm: StationsModel): boolean {
    var event = null;
    for (let e of this._eventsService.selectedEvents.getValue()) {
      let distance = GisHelper.coordinatesToDistance(e.origin, s)
      let bearing = GisHelper.coordinatesToAzimuth(e.origin, s)

      if (!(distance < sm.eventDistanceFrom
        || distance > sm.eventDistanceTo
        || bearing < sm.eventAzimuthFrom
        || bearing > sm.eventAzimuthTo)) {
        event = e;
        break;
      }
    }

    if (event) {
      return true;
    } else {
      return false;
    }
  }

  toggleStationSelection(s: FdsnStationExt) {
    this._mapStations.find(
      p => p.net === s.net && p.stat === s.stat
    ).selected = !s.selected;
    this.refreshStations(this._mapStations);
  }

  removeStationSelection(s: FdsnStation) {
    let i = this._mapStations.indexOf(
      this._mapStations.find(p => p.net === s.net && p.stat === s.stat)
    );
    this._mapStations.splice(i, 1);
    this.refreshStations(this._mapStations);
  }

  removeAllStations() {
    this._mapStations.splice(0, this._mapStations.length);
    this.refreshStations(this._mapStations);
  }

  removeSelectedStations() {
    this._mapStations = this._mapStations.filter(e => e.selected !== true);
    this.refreshStations(this._mapStations);
  }

  invertStationsSelection() {
    for (let s of this._mapStations) {
      s.selected = !s.selected;
    }

    this.refreshStations(this._mapStations);
  }

  // searchNetwork(term: string): Observable<FdsnNetwork[]> {
  //   if (!term.trim()) {
  //     return of([]);
  //   }
  //   return this._eidaService.http.get<FdsnNetwork[]>(this.networksUrl)
  //     .pipe(
  //       tap(_ => this._eidaService.log(`found heroes matching "${term}"`)),
  //       catchError(this._eidaService.handleError<FdsnNetwork[]>('searchNetwork', []))
  //     );
  // }

  getNetworksStations(): Observable<FdsnNetwork[]> {
    return this._eidaService.http.get<FdsnNetwork[]>(this.networksStationsUrl)
      .pipe(
        tap(_ => this._eidaService.log('fetched networks and stations data')),
        catchError(this._eidaService.handleError('getNetworksStations', []))
      );
  }

}