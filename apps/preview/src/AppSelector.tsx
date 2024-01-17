import { Input, Button, Alert, Typography } from "antd";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

export const AppSelector: React.FC = () => {
  const [appId, setAppId] = useState<string>();
  const [error, setError] = useState<string>();
  const navigate = useNavigate();
  const onClick = useCallback(() => {
    if (!appId) {
      setError("Please enter an app id");
      return;
    }
    navigate(`/preview/${appId}`);
  }, [appId, navigate]);

  return (
    <div className="selector">
      <Typography.Title>Ensemble React Preview</Typography.Title>
      <Input
        onChange={(e): void => setAppId(e.target.value)}
        placeholder="Enter app id"
      />
      <Button onClick={onClick} type="primary">
        Preview
      </Button>
      {error ? <Alert message={error} type="error" /> : null}
    </div>
  );
};
