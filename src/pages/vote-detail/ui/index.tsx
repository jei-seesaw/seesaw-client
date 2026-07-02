import { useParams } from "react-router-dom";

export default function VoteDetailPage() {
  const { id } = useParams();
  return <div>투표페이지 id:{id}</div>;
}
