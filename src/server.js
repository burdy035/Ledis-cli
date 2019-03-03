import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import path from "path";

import commandList, { parseSyntax } from "./structures/commands";

const app = express();

const port = 3001;

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.header("Access-Control-Request-Headers", "Content-Type");
    next();
});

app.use(morgan("dev"));

app.use(bodyParser.json({ limit: "50mb" }));

app.use(
    bodyParser.urlencoded({
        limit: "50mb",
        extended: false
    })
);

app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname + "/../public/templates/index.html"));
});

app.post("/send-command", (req, res) => {
    try {
        const { cmdLine, screenshot } = req.body;

        const { syntax, command, args } = parseSyntax(cmdLine);

        if (commandList[command]) {
            let cmd = commandList[command];

            let check = cmd.checkSyntax(syntax);

            if (!check) {
                res.json({
                    success: false,
                    result: "(error) syntax error"
                });
            } else {
                let params =
                    command === "save" ? [screenshot] : cmd.getParams(args);

                res.json({
                    success: true,
                    result: commandList[command].method(...params)
                });
            }
        } else {
            res.json({
                success: false,
                result: "(error) command not found"
            });
        }
    } catch (error) {
        res.json({
            success: false,
            result: "(error) server error"
        });
    }
});

app.listen(process.env.PORT || port, err => {
    if (err) {
        console.log(
            `Can not listen at http://localhost:${process.env.PORT || port}`
        );
    } else {
        console.log(
            `Server is running at http://localhost:${process.env.PORT || port}`
        );
    }
});
