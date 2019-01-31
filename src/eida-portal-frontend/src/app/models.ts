import { Enums } from './modules/enums';

export class StationsModel {
    yearFrom: string;
    yearTo: string;
    coordinateN: number;
    coordinateS: number;
    coordinateE: number;
    coordinateW: number;
    selectedNetwork;
    selectedStation;
    dataSource: Enums.StationDataSource;
    stationSelectionMethod: Enums.StationSelectionMethod;
    streamSelectionMethod: Enums.StationStreamSelectionMethod;
    eventDistanceFrom: number;
    eventDistanceTo: number;
    eventAzimuthFrom: number;
    eventAzimuthTo: number;
    targetSamplingRate: number;

    constructor() {
        this.yearFrom = "1900";
        this.yearTo = "2100";
        this.coordinateN = 90.0;
        this.coordinateS = -90.0;
        this.coordinateE = 180.0;
        this.coordinateW = -180.0;
        this.selectedNetwork = 'All';
        this.selectedStation = 'All';
        this.dataSource = Enums.StationDataSource.Inventory;
        this.stationSelectionMethod = Enums.StationSelectionMethod.Code;
        this.streamSelectionMethod = Enums.StationStreamSelectionMethod.Code;
        this.eventDistanceFrom = 0.0;
        this.eventDistanceTo = 180.0;
        this.eventAzimuthFrom = 0.0;
        this.eventAzimuthTo = 360.0;
        this.targetSamplingRate = 20.0;
    }

    toString() {
        return `Year: ${this.yearFrom} - ${this.yearTo}, 
        coordinates: ${this.coordinateN}N, ${this.coordinateS}S, ${this.coordinateE}E, ${this.coordinateW}W,
        network: ${this.selectedNetwork.code}, station: ${this.selectedStation.stat}`;
    }

    clearStationSelection() {
        this.selectedStation = 'All';
    }
}

export class EventsModel {
    catalogs: {};
    minimumMagnitude: number;
    dateFrom: string;
    dateTo: string;
    depthFrom: number;
    depthTo: number;
    coordinateN: number;
    coordinateS: number;
    coordinateE: number;
    coordinateW: number;
    selectedCatalog: Enums.EventsCatalog;

    constructor() {
        this.catalogs = [
            {
                'id':0,
                'name': "EMSC",
                'url': 'http://www.seismicportal.eu/fdsnws/event/1/query?'
            },
            {
                'id':1,
                'name': "IRIS",
                'url': 'http://service.iris.edu/fdsnws/event/1/query?'
            }
        ];
        this.minimumMagnitude = 0.0;
        this.dateFrom = "2017-01-01";
        this.dateTo = "2018-01-01";
        this.depthFrom = 0;
        this.depthTo = 999;
        this.coordinateN = 90.0;
        this.coordinateS = -90.0;
        this.coordinateE = 180.0;
        this.coordinateW = -180.0;
        this.selectedCatalog = this.catalogs[0];
    }

    toString() {
        return `Catalog: ${this.selectedCatalog},
        minimum magnitude: ${this.minimumMagnitude},
        date: ${this.dateFrom} - ${this.dateTo},
        depth: ${this.depthFrom} - ${this.depthTo},
        coordinates: ${this.coordinateN}N, ${this.coordinateS}S, ${this.coordinateE}E, ${this.coordinateW}W`;
    }
}

export class FdsnEvent {
    id: number;
    time: string;
    magnitude: number;
    magnitudeType: string;
    depth: number;
    latitude: number;
    longitude: number;
    locationReference: string;
    magnitudeReference: string;
}

export class MapModel {

}

export class RequestModel {
    datetimeFrom: string;
    datetimeTo: string;
    fdsnRequestType: {};
    selectedFdsnRequestType;

    constructor() {
        this.datetimeFrom = "2017-01-01T12:00:00";
        this.datetimeTo = "2018-01-01T12:00:00";
        this.fdsnRequestType = [
            {'id': 0, 'name': 'Waveform (Mini-SEED)'},
            {'id': 1, 'name': 'Metadata (StationXML)'},
            {'id': 2, 'name': 'Metadata (Text)'}
        ];
        this.selectedFdsnRequestType = this.fdsnRequestType[0];
    }

    toString() {
        return `Datetime: ${this.datetimeFrom} - ${this.datetimeTo},
        request type: ${this.selectedFdsnRequestType.name}`;
    }
}

export class FdsnNetwork {
    code: string;
    desc: string;
    start: string;
    end: string;
    stations: FdsnStation[];

    constructor() {
        this.code = 'ALL';
        this.desc = 'ALL';
        this.start = '';
        this.end = '';
        this.stations = [];
    }
}

export class FdsnStation {
    net: string;
    stat: string;
    lat: number;
    lon: number;
    elev: number;
    name: string;
    start: string;
    end: string;

    constructor() {
        this.net = 'ALL';
        this.stat = 'ALL';
        this.lat = 0.0;
        this.lon = 0.0;
        this.elev = 0.0;
        this.name = 'All stations';
        this.start = '';
        this.end = '';
    }
}

export class FdsnStationExt extends FdsnStation {
    selected: boolean;

    constructor() {
        super();
        this.selected = true;
    }

    getCoordinates() : string {
        try {
            return `Lat: ${Number(this.lat).toFixed(2)}, Lon: ${Number(this.lon).toFixed(2)}`;   
        } catch {
            return `Lat: ${this.lat}, Lon: ${this.lon}`;
        }
    }
}

export class MapDragBoxCoordinates {
    coordN: number;
    coordS: number;
    coordE: number;
    coordW: number;

    constructor() {
        this.coordN = 90.0;
        this.coordS = -90.0;
        this.coordE = 180.0;
        this.coordW = -180.0;
    }

    getRounded(): MapDragBoxCoordinates {
        this.coordN = Math.round(this.coordN * 100) / 100;
        this.coordS = Math.round(this.coordS * 100) / 100;
        this.coordE = Math.round(this.coordE * 100) / 100;
        this.coordW = Math.round(this.coordW * 100) / 100;
        return this;
    }
}