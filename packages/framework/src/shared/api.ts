import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();

export const generateAPIHash = (props: {
  api: string | undefined;
  inputs: { [key: string]: unknown } | undefined;
  screen: string | undefined;
}): string => {
  return JSON.stringify({ ...props });
};
