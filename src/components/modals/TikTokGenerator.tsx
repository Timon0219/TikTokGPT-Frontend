import { motion } from "framer-motion";
import { useSettings } from "../../store/store";
import { useState } from "react";
import ImageMessage from "../Chat/ImageMessage";

const varinats = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.15 } },
};
interface Props {
  loading: boolean,
  image: string,
  contentLoading: boolean,
  message: string,
  setMessage: (data: string) => void
}
export default function TikTokGeneratorPannel({loading, image, message, setMessage} : Props) {
  const [
    systemMessage,
    useSystemMessageForAllChats,
    setSystemMessage,
    setTikTokGeneratorModalVisible,
  ] = useSettings((state) => [
    state.settings.systemMessage,
    state.settings.useSystemMessageForAllChats,
    state.setSystemMessage,
    state.setTikTokGeneratorModalVisible,
  ]);
  const [useForAllChats, setUseForAllChats] = useState(
    useSystemMessageForAllChats
  );

  function handleOnSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSystemMessage({ message, useForAllChats });
    setTikTokGeneratorModalVisible(false);
  }
  return (
    <motion.div
      variants={varinats}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="sys-msg p-2  rounded-md bg-white dark:bg-gray-800 mx-2 md:mx-0 text-gray-500 dark:text-gray-300 w-full max-w-xl py-4"
    >
      <form onSubmit={handleOnSubmit} className="text-center">
        <label htmlFor="sysmsg" className=" inline-block mb-2">
          TikTok Content
        </label>
        <ImageMessage loading={loading} image={image} />
        <textarea
            name="sysmsg"
            id="sysmsg"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className=" w-full focus:outline-none outline outline-gray-200 focus:ring-2 focus:ring-green-600 dark:focus:ring-green-400 dark:bg-gray-700 dark:text-gray-300 rounded-md p-2"
            placeholder="TikTok Contents here"
            // maxLength={1500}
            rows={5}
        ></textarea>
        <div className="flex justify-end mt-2">
          <button
            className=" bg-teal-200 hover:bg-teal-200 text-gray px-4 py-2 rounded mr-2 cursor-not-allowed"
            type="submit"
            disabled
          >
            post
          </button>
          <button
            className="bg-gray-200 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded"
            onClick={() => setTikTokGeneratorModalVisible(false)}
          >
            Cancel
          </button>
        </div>
      </form>
    </motion.div>
  );
}
