import dayjs from "dayjs";
import advanced_format from "dayjs/plugin/advancedFormat";
import custom_parse_format from "dayjs/plugin/customParseFormat";
import duration_plugin from "dayjs/plugin/duration";
import relative_time from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import week_of_year from "dayjs/plugin/weekOfYear";

dayjs.extend(utc);
dayjs.extend(duration_plugin);
dayjs.extend(advanced_format);
dayjs.extend(relative_time);
dayjs.extend(week_of_year);
dayjs.extend(custom_parse_format);

type Dayjs = dayjs.Dayjs;
export { dayjs, type Dayjs };

export type utc = typeof utc;
export type { Duration, DurationUnitsObjectType, DurationUnitType, CreateDurationType } from "dayjs/plugin/duration";
export type advanced_format = typeof advanced_format;
export type relative_time = typeof relative_time;
export type week_of_year = typeof week_of_year;
export type custom_parse_format = typeof custom_parse_format;