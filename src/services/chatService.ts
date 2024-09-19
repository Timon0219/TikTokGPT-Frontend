import axios from 'axios';
import { ChatMessageType, ModalList, useSettings, useMetrics } from "../store/store";

const apiUrl = "https://api.openai.com/v1/chat/completions";
const IMAGE_GENERATION_API_URL = "https://api.openai.com/v1/images/generations";
const RagSearchUrl = 'http://localhost:8000/query';

let query_time: number[] =  []
let relevancy_score: number[] = []
let total_queries: number[] = []
let avg_query_time: number[] = []
export async function ragSearch(prompt: string, messages: string[], signal: AbortSignal, handleOnData: (data: any) => void, onCompletion: () => void) {
  const response = await axios.post(RagSearchUrl, { query: prompt, use_rag:true }, { signal: signal });
  if (response.status !== 200) {
    console.log(response);
    throw new Error("Error fetching results");
  }
  const resultContent = response.data.result.response || response.data.response;
  query_time = [...query_time, response.data.result.query_time]
  relevancy_score = [...relevancy_score, response.data.result.relevancy_score]
  total_queries = [...total_queries, response.data.result.total_queries]
  avg_query_time = [...avg_query_time, response.data.result.avg_query_time]
  window.localStorage.setItem('query_time', JSON.stringify(query_time))
  window.localStorage.setItem('relevancy_score', JSON.stringify(relevancy_score))
  window.localStorage.setItem('total_queries', JSON.stringify(total_queries))
  window.localStorage.setItem('avg_query_time', JSON.stringify(avg_query_time))
  handleOnData(resultContent);
  onCompletion();
  return {query_time, relevancy_score, total_queries, avg_query_time}
}

export async function fetchResults(
  messages: Omit<ChatMessageType, "id" | "type">[],
  modal: string,
  signal: AbortSignal,
  onData: (data: any) => void,
  onCompletion: () => void
) {
  try {
    const response = await fetch(apiUrl, {
      method: `POST`,
      headers: {
        "content-type": `application/json`,
        accept: `text/event-stream`,
        Authorization: `Bearer ${localStorage.getItem("apikey")}`,
      },
      body: JSON.stringify({
        model: useSettings.getState().settings.selectedModal,
        temperature: 0.7,
        stream: true,
        messages: messages,
      }),
    });

    if (response.status !== 200) {
      console.log(response);
      throw new Error("Error fetching results");
    }
    const reader: any = response.body?.getReader();
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        onCompletion();
        break;
      }

      let chunk = new TextDecoder("utf-8").decode(value, { stream: true });

      const chunks = chunk.split("\n").filter((x: string) => x !== "");

      chunks.forEach((chunk: string) => {
        if (chunk === "data: [DONE]") {
          return;
        }
        if (!chunk.startsWith("data: ")) return;
        chunk = chunk.replace("data: ", "");
        const data = JSON.parse(chunk);
        if (data.choices[0].finish_reason === "stop") return;
        onData(data.choices[0].delta.content);
      });
    }
  } catch (error) {
    if (error instanceof DOMException || error instanceof Error) {
      throw new Error(error.message);
    }
  }
}

export async function fetchModals() {
  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("apikey")}`,
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof DOMException || error instanceof Error) {
      throw new Error(error.message);
    }
  }
}

export type ImageSize =
  | "256x256"
  | "512x512"
  | "1024x1024"
  | "1280x720"
  | "1920x1080"
  | "1024x1024"
  | "1792x1024"
  | "1024x1792";

export type IMAGE_RESPONSE = {
  created_at: string;
  data: IMAGE[];
};
export type IMAGE = {
  url: string;
};
export type DallEImageModel = Extract<ModalList, "dall-e-2" | "dall-e-3">;

export async function generateImage(
  prompt: string,
  size: ImageSize,
  numberOfImages: number
) {
  const selectedModal = "dall-e-3";

  const response = await fetch(IMAGE_GENERATION_API_URL, {
    method: `POST`,
    headers: {
      "content-type": `application/json`,
      accept: `text/event-stream`,
      Authorization: `Bearer ${localStorage.getItem("apikey")}`,
    },
    body: JSON.stringify({
      model: selectedModal,
      prompt: prompt,
      n: numberOfImages,
      size: useSettings.getState().settings.dalleImageSize[
        selectedModal as DallEImageModel
      ],
    }),
  });
  const body: IMAGE_RESPONSE = await response.json();
  return body;
}
