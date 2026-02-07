// src/components/progress/LearningPath.jsx
import React, { useEffect, useState } from "react";
import { progressService } from "../../services/progressService";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Card from "../common/Card";

const LearningPath = ({ courseId }) => {
  const { user } = useSelector((state) => state.auth);
  const [topic, setTopic] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, courseId]);

  const load = async () => {
    if (!courseId || !user?.userId) return;

    try {
      const res = await progressService.recommendNextTopic(user.userId, courseId);
      const next = res?.data?.data ?? res?.data ?? null;
      setTopic(next || null);
    } catch (err) {
      console.error("LearningPath load error:", err);
      setTopic(null);
    }
  };

  if (!topic) return null;

  return (
    <Card className="p-6 mb-6 bg-blue-50 border border-blue-200">
      <h2 className="text-xl font-bold mb-2">Next Suggested Topic</h2>

      <p className="text-lg font-semibold">{topic.name}</p>
      <p className="text-sm text-gray-600 mb-4">{topic.description}</p>

      <button
        onClick={() =>
          navigate(`/courses/${courseId}`, {
            state: { recommendedTopicId: topic.id },
          })
        }
        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        Go to Topic →
      </button>
    </Card>
  );
};

export default LearningPath;
