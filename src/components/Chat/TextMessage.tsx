import classNames from "classnames";
import Avatar from "../Avatar/Avatar";
import { clipboardOutline, checkmarkOutline, logoTiktok } from "ionicons/icons";
import { IonIcon } from "@ionic/react";
import { SyncLoader } from "react-spinners";
import useClipboard from "../../hooks/useClipboard";
import useBot from "../../hooks/useBot";
import { ChatMessageType, useSettings } from "../../store/store";
import Markdown from "react-markdown";
import CodeHighlight from "../CodeHighlight/CodeHighlight";
import { useCallback, useEffect, useState } from "react";
import Modal from "../modals/Modal";
import TikTokGeneratorPannel from "../modals/TikTokGenerator";
import { fetchResults, generateImage, ImageSize } from "../../services/chatService";

type Props = {
  index: number;
  chat: ChatMessageType;
};

const apiUrl = "https://api.openai.com/v1/chat/completions";
const IMAGE_GENERATION_API_URL = "https://api.openai.com/v1/images/generations";

export default function TextMessage({ index, chat }: Props) {
  const { copy, copied } = useClipboard();
  const { result, error, isStreamCompleted, cursorRef } = useBot({
    index,
    chat,
  });
  const [
    isVisible,
    setModalVisible,
    isTikTokGeneratorModalVisible,
    setTikTokGeneratorModalVisible,
    selectedModal,
    modalsList,
    setModal,
  ] = useSettings((state) => [
    state.isModalVisible,
    state.setModalVisible,
    state.isTikTokGeneratorModalVisible,
    state.setTikTokGeneratorModalVisible,
    state.settings.selectedModal,
    state.modalsList,
    state.setModal,
  ]);
  const [ loading, setLoading ] = useState(true);
  const [ image, setImage ] = useState('');
  const [ newlyGeneratedContent, setNewlyGeneratedContent ] = useState('');
  const [ contentLoading, setContentLoading ] = useState(true)
  const [ contentWriting, setContentWriting ] = useState(true)

  const fetchImages = useCallback(handleFetchImages, [
    result
  ]);

  async function handleFetchImages(prompt: string) {
    setLoading(true);
    await generateImage(`Draw a picture of this tiktok content, must focus on the main content of this content, showing what the tiktoker is trying to mention on his tiktok ${prompt}` as string, "256x256", 1)
      .then((image) => {
        setImage(image.data[0].url);
      })
      .catch((error) => {
        console.log(error)
      })
      .finally(() => {
        setLoading(false);
      });
  }
  const controller = new AbortController();
  let signal = controller.signal;
  const contentGenerator = async () => {
    try {
      const response = await fetch(apiUrl, {
        method: `POST`,
        signal: signal,
        headers: {
          "content-type": `application/json`,
          accept: `text/event-stream`,
          Authorization: `Bearer ${localStorage.getItem("apikey")}`,
        },
        body: JSON.stringify({
          model: useSettings.getState().settings.selectedModal,
          temperature: 0.7,
          stream: true,
          messages: [{role: 'user', content: `write a similar tiktok content based on the main idea of this previous content, focusing on what the content about, like a story, monologue story, don;t mention about likes and shares, durations, and other stuffs and return only the monologue content result :${result}`}],
        }),
      })
      if (response.status !== 200) {
        console.log(response);
        throw new Error("Error fetching results");
      }
      setNewlyGeneratedContent('')
      const reader: any = response.body?.getReader();
      while (true) {
        const { done, value } = await reader.read();
  
        if (done) {
          setContentLoading(false);
          break;
        }
  
        let chunk = new TextDecoder("utf-8").decode(value, { stream: true });
  
        const chunks = chunk.split("\n").filter((x: string) => x !== "");
        setContentWriting(true);
        chunks.forEach((chunk: string) => {
          if (chunk === "data: [DONE]") {
            setContentWriting(false);
            return;
          }
          if (!chunk.startsWith("data: ")) return;
          chunk = chunk.replace("data: ", "");
          const data = JSON.parse(chunk);
          if (data.choices[0].finish_reason === "stop") return;
          setNewlyGeneratedContent(prev => prev + data.choices[0].delta.content);
        });
      }
    } catch (e) {
      console.log(e)
    }
  }
  useEffect(() => {
    if (isTikTokGeneratorModalVisible ) { 
      contentGenerator();
    }
  },[isTikTokGeneratorModalVisible])

  useEffect(() => {
    if (contentWriting == false ){
      fetchImages(newlyGeneratedContent);
    }
  }, [contentWriting])

  return (
    <>
      <div className="flex items-start w-full">
        <div className="mr-4  rounded-md flex items-center flex-shrink-0">
          <Avatar className=" h-11 w-11" src="/imgs/bot.png" />
        </div>

        {!result && !error ? (
          <div className=" self-center">
            <SyncLoader color="gray" size={8} speedMultiplier={0.5} />
          </div>
        ) : (
          <div
            className={classNames(
              "  animate-preulse overflow-x-hidden whitespace-pre-wrap",
              { "text-red-500": error, "dark:text-gray-300": !error }
            )}
          >
            <Markdown
              children={result}
              components={{
                code(props) {
                  const { children, className, node, ...rest } = props;
                  const match = /language-(\w+)/.exec(className || "");
                  return match ? (
                    <CodeHighlight language={match[1]}>
                      {String(children).replace(/\n$/, "")}
                    </CodeHighlight>
                  ) : (
                    <code {...rest} className={className?.concat("language")}>
                      {children}
                    </code>
                  );
                },
              }}
            />

            {!isStreamCompleted && !chat.content && (
              <span
                className="ml-1 blink bg-gray-500 dark:bg-gray-200 h-4 w-1 inline-block"
                ref={cursorRef}
              ></span>
            )}
          </div>
        )}
      </div>
      <div className="mt-2 md:mt-0  text-right self-start">
        {!copied ? (
          <button
            className="edit md:ml-8 text-gray-500 dark:text-gray-200 text-xl"
            onClick={() => copy(result)}
          >
            <IonIcon icon={clipboardOutline} />
          </button>
        ) : (
          <span className="dark:text-gray-200 text-gray-500 text-xl">
            <IonIcon icon={checkmarkOutline} />
          </span>
        )}
      </div>
      <div className="mt-2 md:mt-0  text-right self-start ml-3 rounded-s">
          <button
            className="edit md:ml-8 text-gray-500 dark:text-gray-200 text-xl"
            onClick={() => setTikTokGeneratorModalVisible(true)}
          >
            <span className="dark:text-gray-200 text-gray-500 text-xl">
              <IonIcon icon={logoTiktok} />
            </span>
          </button>
      </div>
      <Modal visible={isTikTokGeneratorModalVisible}>
        <TikTokGeneratorPannel loading={loading} image={image} contentLoading={contentLoading} setMessage={setNewlyGeneratedContent} message={newlyGeneratedContent} />
      </Modal>
    </>
  );
}
