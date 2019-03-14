const app = require("./app");
const port = 8080;
app.listen(port, () => {
  console.log(`server is running on http://localhost:${port}`);
});
