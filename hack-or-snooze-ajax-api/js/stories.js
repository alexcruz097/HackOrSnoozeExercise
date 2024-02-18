"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

async function createStories(event) {
  // get value from input
  event.preventDefault();
  let title = $("#title").val();
  let author = $("#author").val();
  let url = $("#url").val();
  // add the new story
  await StoryList.addStory(currentUser, { title, author, url });
  getAndShowStoriesOnStart();

  $("#title").val("");
  $("#author").val("");
  $("#url").val("");
}
/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  $("#story-form").hide();

  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  return $(`
      <li id="${story.storyId}">
      <i class="fa-regular fa-star"></i>
        <a href="${story.url}" target="a_blank" class="story-link">
        </i> ${story.title}
        </a>
        <small class="story-hostname">(${story.url})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }
  $allStoriesList.show();
}

// favorite storie*********************************************
// when the star is clicked
$("#all-stories-list").on("click", ".fa-star", async function () {
  if ($(this).hasClass("fa-regular")) {
    addFavoriteStory($(this));
  } else if ($(this).hasClass("fa-solid")) {
    unfavoriteStory($(this));
  }
});
async function addFavoriteStory(star) {
  try {
    let username = currentUser.username;
    // get the id from the parent of the star
    let storyId = star.parent().attr("id");
    // post to database to favorite the item
    let res = await axios.post(
      `https://hack-or-snooze-v3.herokuapp.com/users/${username}/favorites/${storyId}`,
      { token: currentUser.loginToken }
    );
    // if res is 200 change the star to solid
    if ((res.status = 200)) {
      star.attr("class", "fa-solid fa-star");
    }
  } catch (e) {
    console.log(e);
  }
}

async function unfavoriteStory(star) {
  try {
    let username = currentUser.username;
    // get the id from the parent of the star
    let storyId = star.parent().attr("id");
    // post to database to favorite the item

    console.log(username, storyId)
    let res = await axios.delete(
      `https://hack-or-snooze-v3.herokuapp.com/users/${currentUser.username}/favorites/${storyId}?token=${currentUser.loginToken}`
    );
    // if res is 200 change the star to solid
    if ((res.status = 200)) {
      star.attr("class", "fa-regular fa-star");
    }
  } catch (e) {
    console.log(e);
  }
}

async function generateFavoritesMarkup() {
  // hide all story list
  try {
    let res = await axios.get(
      `https://hack-or-snooze-v3.herokuapp.com/users/${currentUser.username}?token=${currentUser.loginToken}`
    );

    // empty favorite stories container
    $("#favorite-stories-list li").remove();

    let userFavorites = res.data.user.favorites;
    // loop through all of our stories and generate HTML for them
    for (let favorite of userFavorites) {
      const $story = generateStoryMarkup(favorite);
      $("#favorite-stories-list").append($story);
    }
  } catch (error) {
    console.log(error);
  }

  $allStoriesList.empty();
  // hide story form
  $("#story-form").hide();
}
