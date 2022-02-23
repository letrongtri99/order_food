import OrderReposistory from "./reposistories/OrderReposistory";

var CronJob = require('cron').CronJob;

var job = new CronJob('* * * * * *', function () {
    // console.log('You will see this message every second');
    OrderReposistory.getExpiredOrder()
}, null, true, 'UTC');
// job.start();

export default job