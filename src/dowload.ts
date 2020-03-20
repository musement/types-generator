import axios from "axios";
import { Swagger } from "./models/Swagger";

export const getContent = (url: string): Promise<Swagger> =>
  axios({
    method: "get",
    url
  }).then(response => response.data);
