const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");

process.on("message", (payload) => {
  const { tempFilePath, name } = payload;

  const endProcess = (endPayload) => {
    const { statusCode, text, filePath } = endPayload;
    process.send({ statusCode, text, filePath });
    process.exit();
  };

  ffmpeg(tempFilePath)
    .audioChannels(2)

    .addOptions(["-crf 30", "-c:a mp3", "-b:a 64k", "-ac 2"])
    .on("end", () => {
      endProcess({
        statusCode: 200,
        text: "Success",
        filePath: `./temp/${name}`, // Send the file path
      });
    })
    .on("error", (err) => {
      endProcess({ statusCode: 500, text: err.message });
    })
    .save(`./temp/${name}`);
});
