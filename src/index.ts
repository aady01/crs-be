import express, { Request, Response } from "express";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

app.get("", (res: Response, req: Request) => {
  res.json({
    message: "hahah",
  });
});

app.listen(8080, () => {
  console.log("server is on baby");
});
