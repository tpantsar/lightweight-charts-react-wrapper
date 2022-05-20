import {
    IChartApi,
    ISeriesApi,
    SeriesDataItemTypeMap,
    AreaSeriesPartialOptions,
    BarSeriesPartialOptions,
    CandlestickSeriesPartialOptions,
    HistogramSeriesPartialOptions,
    LineSeriesPartialOptions,
    BaselineSeriesPartialOptions,
} from 'lightweight-charts';

import {ActionResult} from './utils';
import {ChartActionResult} from './chart';

export interface AreaSeriesParams extends AreaSeriesPartialOptions {
    type: 'Area';
    reactive?: boolean;
    data: SeriesDataItemTypeMap['Area'][];
}

export interface BarSeriesParams extends BarSeriesPartialOptions {
    type: 'Bar';
    reactive?: boolean;
    data: SeriesDataItemTypeMap['Bar'][];
}

export interface CandlestickSeriesParams extends CandlestickSeriesPartialOptions {
    type: 'Candlestick';
    reactive?: boolean;
    data: SeriesDataItemTypeMap['Candlestick'][];
}

export interface HistogramSeriesParams extends HistogramSeriesPartialOptions {
    type: 'Histogram';
    reactive?: boolean;
    data: SeriesDataItemTypeMap['Histogram'][];
}

export interface LineSeriesParams extends LineSeriesPartialOptions {
    type: 'Line';
    reactive?: boolean;
    data: SeriesDataItemTypeMap['Line'][];
}

export interface BaselineSeriesParams extends BaselineSeriesPartialOptions {
    type: 'Baseline';
    reactive?: boolean;
    data: SeriesDataItemTypeMap['Baseline'][];
}

export type SeriesActionParams =
    | AreaSeriesParams
    | BarSeriesParams
    | CandlestickSeriesParams
    | HistogramSeriesParams
    | LineSeriesParams
    | BaselineSeriesParams

export type SeriesActionResult<T extends SeriesActionParams> = ActionResult<T> & { subject(): ISeriesApi<T['type']>; alive(): boolean }

export function series<T extends SeriesActionParams>(target: ChartActionResult, params: T): SeriesActionResult<T> {
    let subject = createSeries(target.subject(), params);
    let data = params.reactive ? params.data : null;
    let destroyed = false;

    return {
        alive(): boolean {
            return !destroyed;
        },
        subject(): ISeriesApi<T['type']> {
            return subject;
        },
        update(nextParams: T): void {
            const {
                type: nextType,
                data: nextData,
                reactive: nextReactive,
                ...nextOptions
            } = nextParams

            if (nextParams.type !== subject.seriesType()) {
                throw new TypeError('Can not change type of series in runtime. Report a bug please');
            }

            subject.applyOptions(nextOptions);

            if (!nextReactive) {
                data = null;
            }

            if (nextData !== data && nextReactive) {
                data = nextData;
                subject.setData(data);
            }
        },
        destroy(): void {
            if (target.alive()) {
                target.subject().removeSeries(subject);
            }
            destroyed = true;
        }
    };
}

function createSeries<T extends SeriesActionParams>(
    chart: IChartApi,
    params: SeriesActionParams
): ISeriesApi<T['type']> {
    switch (params.type) {
        case 'Area': {
            const series = chart.addAreaSeries(omit(params));
            series.setData(params.data);
            return series;
        }
        case 'Bar': {
            const series = chart.addBarSeries(omit(params));
            series.setData(params.data);
            return series;
        }
        case 'Candlestick': {
            const series = chart.addCandlestickSeries(omit(params));
            series.setData(params.data);
            return series;
        }
        case 'Histogram': {
            const series = chart.addHistogramSeries(omit(params));
            series.setData(params.data);
            return series;
        }
        case 'Line': {
            const series = chart.addLineSeries(omit(params));
            series.setData(params.data);
            return series;
        }
        case 'Baseline': {
            const series = chart.addBaselineSeries(omit(params));
            series.setData(params.data);
            return series;
        }
    }
}

function omit<T extends { reactive?: unknown; data: unknown; type: unknown }>(params: T): Omit<T, 'reactive' | 'data' | 'type'> {
    const {reactive, data, type, ...rest} = params;
    return rest;
}
