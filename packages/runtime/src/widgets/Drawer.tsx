import { useCallback, useState } from 'react';
import { Drawer as AntDrawer } from "antd";
import { WidgetRegistry } from "../registry";
import { useEnsembleAction } from '../runtime/hooks';
import { EnsembleRuntime } from '../runtime';
import { EnsembleWidgetProps } from '../shared/types';
import { EnsembleAction, Expression, EnsembleWidget, useRegisterBindings } from "@ensembleui/react-framework";

export type DrawerProps = {
    height?: string | number;
    width?: string | number;
    position?: Expression<string>;
    onClose?: EnsembleAction;
    title?: Expression<string>;
    children?: EnsembleWidget[];
} & EnsembleWidgetProps<{}>;

type Position = 'left' | 'right' | 'top' | 'bottom';
const positions = ['left', 'right', 'top', 'bottom'] as const;


export const Drawer: React.FC<DrawerProps> = ({ id, height, width, position, onClose, title, children }) => {
    const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
    const { rootRef } = useRegisterBindings({ open: drawerOpen, height, width, position }, id,
        {
            openDrawer: () => setDrawerOpen(true),
            closeDrawer: () => setDrawerOpen(false)
        },
        {
            debounceMs: 300,
        },
    );

    const onCloseAction = useEnsembleAction(onClose);
    const onCloseCallback = useCallback(() => {
        if (!onCloseAction) return;
        return onCloseAction.callback();
    }, [onCloseAction]);

    const handleClose = () => {
        setDrawerOpen(false);
        onCloseCallback();
    }

    return (
        <AntDrawer
            title={title || ''}
            placement={positions.includes(position as Position) ? position as Position : 'left'}
            closable={false}
            open={drawerOpen}
            onClose={handleClose}
            key={'placement'}
            width={width}
            height={height}
            panelRef={rootRef}
        >
            {children ? EnsembleRuntime.render(children) : null}
        </AntDrawer>
    );
}

WidgetRegistry.register('Drawer', Drawer);