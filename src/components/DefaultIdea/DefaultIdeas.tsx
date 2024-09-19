import DefaultIdea from "./DefaultIdea";

const defaultIdeas = [
  { idea: "AI technology tiktok video related to the children", moreContext: "AI technology tiktok video related to the children and AI" },
  {
    idea: "Top 3 image generation tool to use",
    moreContext: "Top 3 Image Generation Tool",
  },
  {
    idea: "The Most Trending TikTok Video",
    moreContext: "The Most Trending TikTok Video, includes likes, comments, content",
  },
  {
    idea: "The Worst TikTok Video",
    moreContext: "The Worst TikTok Video, includes likes, comments and bookmarks, contents",
  },
];

export default function DefaultIdeas({ visible = true }) {
  return (
    <div className={`row1 ${visible ? "block" : "hidden"}`}>
      <DefaultIdea ideas={defaultIdeas.slice(0, 2)} />
      <DefaultIdea
        ideas={defaultIdeas.slice(2, 4)}
        myclassNames="hidden md:visible"
      />
    </div>
  );
}
