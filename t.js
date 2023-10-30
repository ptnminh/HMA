const ChildProcess = require("child_process");

const reloadCron = () => {
  ChildProcess.exec("rm -rf files", (err, stdout) => {
    if (err) {
      console.error(`exec error: ${err}`);
      return;
    }

    console.log(stdout);
  });
  ChildProcess.exec("mkdir files", (err, stdout) => {
    if (err) {
      console.error(`exec error: ${err}`);
      return;
    }

    console.log(stdout);
  });
  //   ChildProcess.exec("pm2 reload facebook_posts-cron", (err, stdout) => {
  //     if (err) {
  //       console.error(`exec error: ${err}`);
  //       return;
  //     }

  //     console.log(stdout);
  //   });
};
reloadCron();
