#!/usr/bin/env node
"use strict";

import * as dotenv from "dotenv";
dotenv.config(); // load environment variables from a .env file into process.env

import "./server.js"; // import the server file to start the server
