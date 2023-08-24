export const Button: React.FC = () => {
  return (
    // eslint-disable-next-line no-alert
    <button onClick={(): void => alert("booped")} type="button">
      Boop
    </button>
  );
};
