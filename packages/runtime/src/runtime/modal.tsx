import { Button, Modal } from "antd";
import React from "react";
import { IModalProps } from "react-global-modal-plus";

type IAntModalProps = IModalProps & {
  width?: number;
  centered?: boolean;
  titleComponent?: React.ReactNode;
  maskClosable?: boolean;
};

export const CustomModal = React.forwardRef<IAntModalProps>(
  (props: IAntModalProps) => {
    const {
      children,
      open,
      className = "",
      title,
      onModalClose = () => {},
      footer,
      width,
      closeIconComponent,
      actions = [],
      centered = true,
      titleComponent,
      maskClosable,
    } = props;

    let footerComponent: React.ReactNode | null = null;

    if (actions.length > 0)
      footerComponent = actions.map((el: any) => (
        <Button
          key={el.title}
          className={el.className}
          onClick={() => el?.onClick()}
        >
          {el.title}
        </Button>
      ));

    if (footer) footerComponent = footer;

    return (
      <Modal
        open={open}
        title={titleComponent || title}
        onCancel={onModalClose}
        footer={footerComponent}
        width={width}
        closeIcon={closeIconComponent}
        maskClosable={maskClosable}
        centered={centered}
        bodyStyle={{
          margin: 0,
          padding: 0,
        }}
        className={className}
      >
        <div
          style={{
            position: "relative",
          }}
        >
          {children}
        </div>
      </Modal>
    );
  },
);
