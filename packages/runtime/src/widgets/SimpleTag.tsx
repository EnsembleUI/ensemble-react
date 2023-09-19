import React from 'react';
import { Tag } from 'antd';
import { WidgetRegistry } from '../registry';
import { Expression } from 'framework';
import { EnsembleWidgetProps } from '../util/types';

type SimpleTagProps = {
  label?: Expression<string>;
  color?: Expression<string>;
  labelColor?: Expression<string>;
  [key: string]: unknown;
} & EnsembleWidgetProps;

const SimpleTag: React.FC<SimpleTagProps> = ({
  label, 
  color,
  labelColor
}) => (
  <>
    <Tag color={color || "success"} style={{
      color: labelColor || "#888"
    }}>{label}</Tag>
  </>
);

WidgetRegistry.register("SimpleTag", SimpleTag);