/* eslint import/first: 0 */
const fetchMock = jest.fn<
  Promise<{ body: { data: string }; isSuccess: boolean }>,
  any[]
>();
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const frameworkActual = jest.requireActual("@ensembleui/react-framework");

import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import "../../../widgets";
import { BrowserRouter } from "react-router-dom";
import { EnsembleScreen } from "../../screen";

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock("@ensembleui/react-framework", () => ({
  ...frameworkActual,
  DataFetcher: {
    uploadFiles: fetchMock,
  },
}));

describe("file upload with pick files", () => {
  const logSpy = jest.spyOn(console, "log").mockImplementation(jest.fn());
  jest.spyOn(console, "error").mockImplementation(jest.fn());

  afterEach(() => {
    logSpy.mockClear();
    jest.clearAllMocks();
  });

  test("upload files using uploadFiles", async () => {
    fetchMock.mockResolvedValue({ body: { data: "foobar" }, isSuccess: true });

    render(
      <EnsembleScreen
        screen={{
          name: "test_cache",
          id: "test_cache",
          onLoad: {
            executeCode: "ensemble.storage.set('token', 'Testtoken123')",
          },
          body: {
            name: "Button",
            properties: {
              label: "Test Cache",
              onTap: {
                pickFiles: {
                  id: "imageInput",
                  allowedExtensions: ["jpg", "png"],
                  onComplete: {
                    uploadFiles: {
                      uploadApi: "https://randomuser.me/api",
                      files: "Test Files",
                      inputs: {
                        // eslint-disable-next-line no-template-curly-in-string
                        headerToken: "${ensemble.storage.get('token')}",
                      },
                      onComplete: {
                        executeCode: "console.log('Success')",
                      },
                      onError: {
                        executeCode: "console.log('Error uploading files')",
                      },
                    },
                  },
                },
              },
            },
          },
          apis: [
            {
              name: "https://randomuser.me/api",
              method: "POST",
            },
          ],
        }}
      />,
      { wrapper: BrowserRouter },
    );

    const imageBlob = new Blob(["image binary data"], { type: "image/png" });
    const files = [new File([imageBlob], "example.png", { type: "image/png" })];

    const pickFiles = document.querySelector("input") as HTMLInputElement;

    // Upload file
    await waitFor(() => {
      userEvent.upload(pickFiles, files);
    });

    // First verify file is uploaded
    await waitFor(() => {
      expect(pickFiles.files).toHaveLength(1);
      expect(pickFiles.files?.[0].name).toBe("example.png");
      expect(logSpy).toHaveBeenCalledWith("Success");
    });

    await waitFor(() => {
      expect(fetchMock.mock.calls[0][4]).toEqual(
        expect.objectContaining({
          headerToken: "Testtoken123",
        }),
      );
    });
  });
});
