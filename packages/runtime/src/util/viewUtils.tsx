import * as MuiIcons from "@mui/icons-material";

export const renderMuiIcon = (
  iconName: keyof typeof MuiIcons,
  width?: string,
  height?: string
) => {
  const MuiIconComponent = MuiIcons[iconName];
  if (MuiIconComponent) {
    return (
      <MuiIconComponent
        style={{
          width: width ?? "15px",
          height: height ?? "15px",
        }}
      />
    );
  }
  return null;
};
