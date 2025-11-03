import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import isBetween from 'dayjs/plugin/isBetween';
import updateLocale from 'dayjs/plugin/updateLocale';

// Extend dayjs with required plugins for Ant Design DatePicker
dayjs.extend(customParseFormat);
dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);
dayjs.extend(advancedFormat);
dayjs.extend(isBetween);
dayjs.extend(updateLocale);

export default dayjs;
