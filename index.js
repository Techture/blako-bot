var Twit = require("twit");
var request = require("request");
var fs = require("fs");

const {
  apikey,
  apiSecretKey,
  accessToken,
  accessTokenSecret,
  nasaApiKey,
} = require("./secrets");

var bot = new Twit({
  consumer_key: apikey,
  consumer_secret: apiSecretKey,
  access_token: accessToken,
  access_token_secret: accessTokenSecret,
  timeout_ms: 60 * 1000,
});

// GET MEDIA >> get then add media to a tweet
function getPhoto() {
  var parameters = {
    url: "https://api.nasa.gov/planetary/apod",
    qs: {
      api_key: nasaApiKey,
    },
    encoding: "binary",
  };
  request.get(parameters, function (err, response, body) {
    body = JSON.parse(body);
    saveFile(body, "nasa.jpg");
  });
}

function saveFile(body, fileName) {
  var file = fs.createWriteStream(fileName);
  request(body)
    .pipe(file)
    .on("close", function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Media Saved >>");
        // console.log(
        //   `Title: ${body.title}\nExplanation: ${body.explanation}\n------------------`
        // );
        var descriptionText = body.title;
        uploadMedia(descriptionText, fileName);
      }
    });
}

function uploadMedia(descriptionText, fileName) {
  var filePath = __dirname + "/" + fileName;
  bot.postMediaChunked({ file_path: filePath }, function (err, data, response) {
    if (err) {
      console.log(err);
    } else {
      console.log(data);
      var params = {
        status: descriptionText,
        media_ids: data.media_id_string,
      };
      postStatus(params);
    }
  });
}

function postStatus(params) {
  bot.post("statuses/update", params, function (err, data, response) {
    if (err) {
      console.log(err);
    } else {
      console.log("Status posted!");
    }
  });
}

// uploadMedia("Video From NASA", "nasa_video.mp4"); // add video to timeline
// getPhoto();

// STREAM >> stream tweets
function streamTweets() {
  var stream = bot.stream("statuses/filter", {
    track: "#plaxfl, #xfl",
    // q: "#xfl since:2010-01-01", // show tweets from a certain date
  });
  stream.on("tweet", function (tweet) {
    console.log(tweet.text + "\n");
  });
}
// streamTweets();

// POST >> tweet to timeline
function writeTweet() {
  bot.post(
    "statuses/update",
    { status: "testing testing :)" },
    function (err, data, response) {
      if (err) {
        console.log(err);
      } else {
        console.log(data.text + " was tweeted.");
      }
    }
  );
}
// writeTweet();

// GET >> screen_name from list of followers
function getScreenName() {
  bot.get(
    "followers/list",
    { screen_name: "blakoBot" },
    function (err, data, response) {
      if (err) {
        console.log(err);
      } else {
        data.users.forEach((user) => {
          return console.log(user.screen_name);
        });
      }
    }
  );
}
// getScreenName();

// GET >> tweets from timeline
function getBotTimeline() {
  bot.get(
    "statuses/home_timeline",
    { count: 5 },
    function (err, data, response) {
      if (err) {
        console.log(err);
      } else {
        let counter = 0;
        data.forEach((d) => {
          counter++;
          console.log(
            `${counter}.\n${d.text}\n${d.user.screen_name}\n${d.id_str}\n------------------`
          );
        });
      }
    }
  );
}
// getBotTimeline();

// POST >> retweet
function retweet() {
  bot.post(
    "statuses/retweet/:id",
    { id: "1350843610363699200" },
    function (err, data, response) {
      if (err) {
        console.log(err);
      } else {
        console.log(data.text + " was retweeted.");
      }
    }
  );
}
// retweet();

// POST >> unretweet
function unretweet() {
  bot.post(
    "statuses/unretweet/:id",
    { id: "1350843610363699200" },
    function (err, data, response) {
      if (err) {
        console.log(err);
      } else {
        console.log(data.text + " was unretweeted.");
      }
    }
  );
}
// unretweet();

// POST >> like a tweet
function likeTweet() {
  bot.post(
    "favorites/create",
    { id: "1351660831847673860" },
    function (err, data, response) {
      if (err) {
        console.log(err);
      } else {
        console.log(data.text + " was liked.");
      }
    }
  );
}
// likeTweet();

// POST >> unlike a tweet
function unlikeTweet() {
  bot.post(
    "favorites/destroy",
    { id: "1351660831847673860" },
    function (err, data, response) {
      if (err) {
        console.log(err);
      } else {
        console.log(data.text + " was unliked.");
      }
    }
  );
}

// POST >> reply to a tweet
function replyToTweet() {
  bot.post(
    "statuses/update",
    {
      status: "@MikeTyson you da man again!",
      in_reply_to_status_id: "1351660831847673860",
    },
    function (err, data, response) {
      if (err) {
        console.log(err);
      } else {
        console.log(data.text + " was replied to.");
      }
    }
  );
}
// replyToTweet();

// POST/DELETE >> delete a tweet
function deleteTweet(id) {
  bot.post("statuses/destroy/:id", { id }, function (err, data, response) {
    if (err) {
      console.log(err);
    } else {
      console.log(data.text + " was deleted.");
    }
  });
}
// deleteTweet();

// SEARCH/POST >> search for a tweet
function searchTweet() {
  bot.get(
    "search/tweets",
    {
      q: "#xfl OR #playXFL", // show tweets with one or two different tags
      // q: "#superbowl ?", // show tweets with questions
      // q: "#xfl since:2010-01-01", // show tweets from a certain date
      // q: "#XFL filter:links", // show tweets with links
      // geocode: "40.7155781793349, - 73.96786809018404, 50mi", // show tweets with geofence
      // lang: 'es' // tweets other than english
      // result_type: "recent", // check for most recent/popular tweet
      count: 5,
    },
    function (err, data, response) {
      if (err) {
        console.log(err);
      } else {
        let counter = 0;
        data.statuses.forEach((s) => {
          counter++;
          console.log(
            `${counter}.\n${s.text}\n${s.user.screen_name}\n${s.id_str}\n------------------`
          );
        });
      }
    }
  );
}
// searchTweet();
