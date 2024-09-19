
import React, { useEffect, useState } from 'react';
import './table.css';

export default function Metrics() {
    const [query_time, setQueryTime] = useState('[]')
    const [relevancy_score, setRelevancyScore] = useState('[]')
    const [total_queries, setTotalQueries] = useState('[]')
    const [avg_query_time, setAvgQueryTime] = useState('[]')
    const [count, setCount] = useState(0);

    useEffect(() => {
      const interval = setInterval(() => {
        setCount(prevCount => prevCount + 1);
      }, 1000);
      console.log(count,'re-render here')
      return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    useEffect(() => {
        const query_time = window.localStorage.getItem('query_time') || '[]'
        const relevancy_score = window.localStorage.getItem('relevancy_score') || '[]'
        const total_queries = window.localStorage.getItem('total_queries') || '[]'
        const avg_query_time = window.localStorage.getItem('avg_query_time') || '[]'
        setQueryTime(query_time);
        setRelevancyScore(relevancy_score);
        setTotalQueries(total_queries);
        setAvgQueryTime(avg_query_time);
    },[query_time, relevancy_score, total_queries, avg_query_time, {}])

    return (
        <div className="flex items-start justify-center sticky top-1 max-w-[80%] mx-auto">
            <table>
                <tr>
                    <th>Query Time</th>
                    <th>Relevancy Score</th>
                    <th>Total Queries</th>
                    <th>Avg Query TIme</th>
                </tr>
                {<tr>
                    <td>{JSON.parse(query_time)[JSON.parse(query_time).length - 1]}</td>
                    <td>{JSON.parse(relevancy_score)[JSON.parse(query_time).length - 1]}</td>
                    <td>{JSON.parse(total_queries)[JSON.parse(query_time).length - 1]}</td>
                    <td>{JSON.parse(avg_query_time)[JSON.parse(query_time).length - 1]}</td>
                </tr> }
            </table>
        </div>
    );
}