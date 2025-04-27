import express from "express";
import { createRequestDemoService } from "../services/requestdemo/requestdemo.service";

const RequestDemo = express.Router();

RequestDemo.post("/data", createRequestDemoService);

export default RequestDemo;
