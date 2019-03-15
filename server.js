const app = require("./app");
const port = process.env.PORT || 8080;

inDevEnv = process.env.NODE_ENV === "dev";

app.listen(port, () => {
  if (inDevEnv) {
    console.log(`server is running on http://localhost:${port}`);
  } else {
    console.log(`server is running on heroku:${port}`);
  }
});
