import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createWithEqualityFn } from "zustand/traditional";
import { shallow } from "zustand/shallow";
import { produce } from "immer";
import moment from "moment";
import { ImageSize } from "../services/chatService";

const modalsList = [
  "gpt-3.5-turbo",
  "gpt-3.5-turbo-1106",
  "gpt-3.5-turbo-16k-0613",
  "gpt-3.5-turbo-16k",
  "gpt-3.5-turbo-0613",
  'text-davinci-003',
  "gpt-4",
  "gpt-4-0613",
  "gpt-4-0314",
  "gpt-4-1106-preview",
  "dall-e-3",
  "dall-e-2",
] as const;

export interface ChatMessageType {
  role: "user" | "assistant" | "system";
  content: string ;
  type: "text" | "image_url";
  id: string;
}
export interface SystemMessageType {
  message: string;
  useForAllChats: boolean;
}
export interface ModalPermissionType {
  id: string;
  object: string;
  created: number;
  allow_create_engine: boolean;
  allow_sampling: boolean;
  allow_logprobs: boolean;
  allow_search_indices: boolean;
  allow_view: boolean;
  allow_fine_tuning: boolean;
  organization: string;
  group: null;
  is_blocking: boolean;
}
export interface ModalType {
  id: string;
  object: string;
  created: number;
  owned_by: string;
  permission: ModalPermissionType[];
  root: string;
  parent: null;
}
export type Theme = "dark" | "light";

export interface ThemeType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}
export interface AddMetricsType {
  qt: number; 
  rs: number; 
  tq: number; 
  aq: number; 
}

export interface GetMetricsType {
  query_time: number[]; 
  relevancy_score: number[]; 
  total_queries: number[]; 
  avg_query_time: number[];
}

export interface MetricType {
  query_time: number[];
  relevancy_score: number[];
  total_queries: number[];
  avg_query_time: number[];
  addMetrics: (value: AddMetricsType) => void;
  getMetrics: () => GetMetricsType;
}

const useMetrics = create<MetricType>((set, get) => ({
  query_time: [],
  relevancy_score: [],
  total_queries: [],
  avg_query_time: [],
  
  addMetrics: ({qt, rs, tq, aq}: AddMetricsType) => 
    set(state => ({
      query_time: [...state.query_time, qt],
      relevancy_score: [...state.relevancy_score, rs],
      total_queries:[...state.total_queries, tq],
      avg_query_time:[...state.avg_query_time, aq]
    })),
  
  getMetrics: () => ({
    query_time: get().query_time,
    relevancy_score: get().relevancy_score,
    total_queries: get().total_queries,
    avg_query_time: get().avg_query_time
  })
}));

export type ModalList = (typeof modalsList)[number];

export interface SettingsType {
  settings: {
    sendChatHistory: boolean;
    systemMessage: string;
    useSystemMessageForAllChats: boolean;
    selectedModal: ModalList;
    dalleImageSize: { "dall-e-2": ImageSize; "dall-e-3": ImageSize };
  };
  modalsList: readonly string[];
  isTikTokGeneratorModalVisible: boolean;
  isSystemMessageModalVisible: boolean;
  setSystemMessageModalVisible: (value: boolean) => void;
  isModalVisible: boolean;
  setSystemMessage: (value: SystemMessageType) => void;
  setTikTokGeneratorModalVisible: (value: boolean) => void;
  setSendChatHistory: (value: boolean) => void;
  setModalVisible: (value: boolean) => void;
  setModalsList: (value: string[]) => void;
  setModal: (value: ModalList) => void;
  setDalleImageSize: (value: ImageSize, type: "dall-e-2" | "dall-e-3") => void;
}
export interface ChatType {
  chats: ChatMessageType[];
  chatHistory: string[];
  addChat: (chat: ChatMessageType, index?: number) => void;
  editChatMessage: (chat: string, updateIndex: number) => void;
  addNewChat: () => void;
  saveChats: () => void;
  viewSelectedChat: (chatId: string) => void;
  resetChatAt: (index: number) => void;
  handleDeleteChats: (chatid: string) => void;
  editChatsTitle: (id: string, title: string) => void;
  clearAllChats: () => void;
}

export interface UserType {
  name: string;
  email: string;
  avatar: string;
}

export interface AuthType {
  token: string;
  apikey: string;
  setToken: (token: string) => void;
  setUser: (user: { name: string; email: string; avatar: string }) => void;
  setApiKey: (apikey: string) => void;
  user: UserType;
}

const useChat = create<ChatType>((set, get) => ({
  chats: [],
  chatHistory: localStorage.getItem("chatHistory")
    ? JSON.parse(localStorage.getItem("chatHistory") as string)
    : [],
  addChat: (chat, index) => {
    set(
      produce((state: ChatType) => {
        if (index || index === 0) state.chats[index] = chat;
        else {
          state.chats.push(chat);
        }
      })
    );
    if (chat.role === "assistant" && chat.content) {
      get().saveChats();
    }
  },
  editChatMessage: (chat, updateIndex) => {
    set(
      produce((state: ChatType) => {
        state.chats[updateIndex].content = chat;
      })
    );
  },
  addNewChat: () => {
    if (get().chats.length === 0) return;
    set(
      produce((state: ChatType) => {
        state.chats = [];
      })
    );
  },

  saveChats: () => {
    let chat_id = get().chats[0].id;
    let title;
    if (localStorage.getItem(chat_id)) {
      const data = JSON.parse(localStorage.getItem(chat_id) ?? "");
      if (data.isTitleEdited) {
        title = data.title;
      }
    }
    const data = {
      id: chat_id,
      createdAt: new Date().toISOString(),
      chats: get().chats,
      title: title ? title : get().chats[0].content,
      isTitleEdited: Boolean(title),
    };

    localStorage.setItem(chat_id, JSON.stringify(data));
    if (get().chatHistory.includes(chat_id)) return;
    localStorage.setItem(
      "chatHistory",
      JSON.stringify([...get().chatHistory, chat_id])
    );
    set(
      produce((state: ChatType) => {
        state.chatHistory.push(chat_id);
      })
    );
  },
  viewSelectedChat: (chatId) => {
    set(
      produce((state: ChatType) => {
        if (!localStorage.getItem(chatId)) return;
        state.chats =
          JSON.parse(localStorage.getItem(chatId) ?? "")?.chats ?? [];
      })
    );
  },
  resetChatAt: (index) => {
    set(
      produce((state: ChatType) => {
        state.chats[index].content = "";
      })
    );
  },
  handleDeleteChats: (chatid) => {
    set(
      produce((state: ChatType) => {
        state.chatHistory = state.chatHistory.filter((id) => id !== chatid);
        state.chats = [];
        localStorage.removeItem(chatid);
        localStorage.setItem("chatHistory", JSON.stringify(state.chatHistory));
      })
    );
  },
  editChatsTitle: (id, title) => {
    set(
      produce((state: ChatType) => {
        const chat = JSON.parse(localStorage.getItem(id) ?? "");
        chat.title = title;
        chat.isTitleEdited = true;
        localStorage.setItem(id, JSON.stringify(chat));
      })
    );
  },
  clearAllChats: () => {
    set(
      produce((state: ChatType) => {
        state.chatHistory.forEach((id) => {
          localStorage.removeItem(id);
        });
        state.chats = [];
        state.chatHistory = [];
        localStorage.removeItem("chatHistory");
      })
    );
  },
}));

const useAuth = create<AuthType>()(
  persist(
    (set) => ({
      token: localStorage.getItem("token") || "",
      apikey: localStorage.getItem("apikey") || "",
      user: {
        name: "User",
        email: "",
        avatar: "/imgs/default-avatar.jpg",
      },
      setToken: (token) => {
        set(
          produce((state) => {
            state.token = token;
          })
        );
      },
      setUser: (user) => {
        set(
          produce((state) => {
            state.user = user;
          })
        );
      },
      setApiKey: (apikey) => {
        set(
          produce((state) => {
            state.apikey = apikey;
          })
        );
        localStorage.setItem("apikey", apikey);
      },
    }),
    {
      name: "auth",
    }
  )
);

const useSettings = createWithEqualityFn<SettingsType>()(
  persist(
    (set) => ({
      settings: {
        sendChatHistory: false,
        systemMessage: "",
        useSystemMessageForAllChats: false,
        selectedModal: "gpt-3.5-turbo",
        dalleImageSize: { "dall-e-2": "256x256", "dall-e-3": "1024x1024" },
      },
      modalsList: modalsList,
      isTikTokGeneratorModalVisible: false,
      isSystemMessageModalVisible: false,
      setSystemMessageModalVisible(value) {
        
      },
      isModalVisible: false,
      setSystemMessage: (value) => {
        set(
          produce((state: SettingsType) => {
            state.settings.systemMessage = value.message;
            state.settings.useSystemMessageForAllChats = value.useForAllChats;
          })
        );
      },
      setTikTokGeneratorModalVisible: (value) => {
        set(
          produce((state: SettingsType) => {
            state.isTikTokGeneratorModalVisible = value;
          })
        );
      },
      setSendChatHistory: (value) => {
        set(
          produce((state: SettingsType) => {
            state.settings.sendChatHistory = value;
          })
        );
      },
      setModal: (value) => {
        set(
          produce((state: SettingsType) => {
            state.settings.selectedModal = value;
          })
        );
      },
      setModalVisible: (value) => {
        set(
          produce((state: SettingsType) => {
            state.isModalVisible = value;
          })
        );
      },
      setModalsList: (value) => {
        set(
          produce((state: SettingsType) => {
            state.modalsList = value;
          })
        );
      },
      setDalleImageSize: (value, type) => {
        set(
          produce((state: SettingsType) => {
            state.settings.dalleImageSize[type] = value;
          })
        );
      },
    }),
    {
      name: "settings",
      version: 1,
      partialize: (state: SettingsType) => ({ settings: state.settings }),
      migrate: (persistedState: unknown, version: number) => {
        if (version === 0) {
          (persistedState as SettingsType["settings"]).dalleImageSize = {
            "dall-e-2": "256x256",
            "dall-e-3": "1024x1024",
          };
        }

        return persistedState as SettingsType;
      },
    }
  ),
  shallow
);

const useTheme = create<ThemeType>()(
  persist(
    (set) => ({
      theme: "light",
      setTheme: (theme) => {
        set(
          produce((state) => {
            state.theme = theme;
          })
        );
      },
    }),
    {
      name: "theme",
    }
  )
);

export const months = [
  "Januray",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
export const priority = [
  "Today",
  "Previous 7 Days",
  "Previous 30 Days",
  "This month",
].concat(months);

export const selectChatsHistory = (state: ChatType) => {
  const sortedData: Record<
    string,
    { title: string; id: string; month: string; month_id: number }[]
  > = {};
  state.chatHistory.forEach((chat_id) => {
    const { title, id, createdAt } = JSON.parse(
      localStorage.getItem(chat_id) as string
    );
    const myDate = moment(createdAt, "YYYY-MM-DD");
    const currentDate = moment();
    const month = myDate.toDate().getMonth();

    const data = {
      title,
      id,
      month: months[month],
      month_id: month,
    };

    if (myDate.isSame(currentDate.format("YYYY-MM-DD"))) {
      if (!sortedData.hasOwnProperty("Today")) {
        sortedData["Today"] = [];
      }
      sortedData["Today"].push(data);
      return;
    } else if (currentDate.subtract(7, "days").isBefore(myDate)) {
      if (!sortedData.hasOwnProperty("Previous 7 Days")) {
        sortedData["Previous 7 Days"] = [];
      }
      sortedData["Previous 7 Days"].push(data);
      return;
    } else if (currentDate.subtract(30, "days").isBefore(myDate)) {
      if (!sortedData.hasOwnProperty("Previous 30 Days")) {
        sortedData["Previous 30 Days"] = [];
      }
      sortedData["Previous 30 Days"].push(data);
      return;
    } else {
      if (!sortedData.hasOwnProperty(months[month])) {
        sortedData[months[month]] = [];
      }
      sortedData[months[month]].push(data);
    }
  });
  // const history = Object.keys(sortedData);
  return sortedData;
};

export const selectUser = (state: AuthType) => state.user;
export const chatsLength = (state: ChatType) => state.chats.length > 0;
export const isDarkTheme = (state: ThemeType) => state.theme === "light";
export const isChatSelected = (id: string) => (state: ChatType) =>
  state.chats[0]?.id === id;

export default useChat;
export { useAuth, useSettings, useTheme, useMetrics };
