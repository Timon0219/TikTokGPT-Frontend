import React, { useEffect, useMemo, useState } from "react";
import Navbar from "./components/Navbar/Navbar";
import DefaultIdeas from "./components/DefaultIdea/DefaultIdeas";
import UserQuery from "./components/UserInput/UserQuery";
import GptIntro from "./components/Ui/GptIntro";
import { IonIcon, setupIonicReact } from "@ionic/react";
import { menuOutline, addOutline } from "ionicons/icons";
import useChat, { chatsLength, MetricType, useAuth, useTheme } from "./store/store";
import classNames from "classnames";
import Chats from "./components/Chat/Chats";
import Metrics from "./components/Metrics/Metrics";

setupIonicReact();
interface MetricContextType {
  metrics: any;
  setMetrics: (value: any) => void
}
export const MetricsContext = React.createContext<MetricContextType>({metrics: {}, setMetrics: () => {}})

interface MetricsType {
  query_time: number, 
  relevancy_score: number, 
  total_queries: number, 
  avg_query_time: number,
}
function App() {
  const [active, setActive] = useState(false);
  const [metrics, setMetrics] = useState<MetricsType>()
  const isChatsVisible = useChat(chatsLength);
  const addNewChat = useChat((state) => state.addNewChat);
  const [theme] = useTheme((state) => [state.theme]);
  const apiKey = 'sk--wgT5Os0yh65yiaLY39ycJii98y9zQ6Y4alSi4dQ48T3BlbkFJHZHitsUUCDO48X3MDSWMFdtpeotEy71XvyQMBpf8cA';
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    window.localStorage.setItem('apikey', apiKey)
  }, [theme]);
  const value = useMemo(() => ({ metrics, setMetrics }), [metrics])
  return (
    <MetricsContext.Provider value={value}>
      <div className="App  font-montserrat md:flex ">
        <Navbar active={active} setActive={setActive} />
        <div className="">
          <button
            type="button"
            className="shadow fixed p-2 h-8 w-8 text-sm top-4 left-4 border-2 hidden md:inline-flex dark:text-white text-gray-700 dark:border border-gray-400 rounded-md items-center justify-center"
            onClick={() => setActive(true)}
          >
            <i className="fa-regular fa-window-maximize rotate-90"></i>
          </button>
        </div>
        <div className="p-3 z-10 flex items-center justify-between bg-[#202123] dark:bg-[#343541] border-b sticky top-0  text-gray-300 md:hidden">
          <button onClick={() => setActive(true)} className=" text-2xl flex">
            <IonIcon icon={menuOutline} />
          </button>
          <h2>New chat</h2>
          <button className="text-2xl flex items-center" onClick={addNewChat}>
            <IonIcon icon={addOutline} />
          </button>
        </div>
        <main
          className={classNames(" w-full transition-all duration-500", {
            "md:ml-[260px]": active,
          })}
        >
          {isChatsVisible ? <Metrics /> : <GptIntro />}
          {isChatsVisible && <Chats />}
          <div
            className={classNames(
              "fixed left-0 px-2  right-0 transition-all duration-500 bottom-0 dark:shadow-lg py-1 shadow-md backdrop-blur-sm bg-white/10 dark:bg-dark-primary/10",
              {
                "dark:bg-dark-primary bg-white": isChatsVisible,
                "md:ml-[260px]": active,
              }
            )}
          >
            <div className="max-w-2xl md:max-w-[calc(100% - 260px)] mx-auto">
              {!isChatsVisible && (
                <>
                  <DefaultIdeas />
                </>
              )}

              <div className="dark:bg-inherit">
                <UserQuery />
              </div>
            </div>
          </div>
        </main>
      </div>
    </MetricsContext.Provider>
  );
}

export default App;
