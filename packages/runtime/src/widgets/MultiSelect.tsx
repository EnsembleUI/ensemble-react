import React, { useRef, useState } from 'react';
import { Select as SelectComponent, Space } from 'antd';
import type { InputRef } from 'antd';
import { WidgetRegistry } from '../registry';
import { PlusCircleOutlined } from '@ant-design/icons';
import { Expression } from 'framework';
import { EnsembleWidgetProps } from '../util/types';

type SelectOption = {
  label: Expression<string>;
  value: Expression<string | number>;
}
export type MultiSelectProps = {
  placeholder?: Expression<string>;
  data: SelectOption[];
  defaultValue: string[];
  width: string;
  [key: string]: unknown;
} & EnsembleWidgetProps;

const MultiSelect: React.FC<MultiSelectProps> = (props) => {
  const { placeholder, data, defaultValue, width } = props;
  const [items, setItems] = useState(data);
  const [name, setName] = useState('');
  const [selectedValue, setSelectedValue] = useState<string[] | undefined>(undefined);

  const addItem = () => {
    if (selectedValue) {
      setSelectedValue([...selectedValue, name]);
    } else {
      setSelectedValue([name]);
    }
    setItems([...items, {
      label: name,
      value: name
    }])
    setName('');
  };

  const handleChange = (value: string[]) => {
    setSelectedValue(value)
  };

  return (
    <SelectComponent
      mode="multiple"
      style={{ width: width || '100%' }}
      placeholder={placeholder || 'Select'}
      onChange={handleChange}
      value={selectedValue}
      defaultValue={defaultValue}
      onSearch={(v) => {
        if (items.some(o => o.label?.toString().startsWith(v))) {
          setName('')
        } else {
          setName(v)
        }
      }}
      notFoundContent={<></>}
      dropdownRender={(menu) => (
        <>
          {menu}
          {name && <Space
            onClick={() => addItem()}
            style={{
              padding: '10px 15px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              width: '100%',
              cursor: 'pointer'
            }}
          >
            <span>There are no matches</span>
            <Space>
              <PlusCircleOutlined />
              <span>{`Add "${name}"`}</span>
            </Space>
          </Space>}
        </>
      )}
      options={items}
    />
  )
};

WidgetRegistry.register("MultiSelect", MultiSelect);
