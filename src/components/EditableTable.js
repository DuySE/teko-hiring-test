import React, { useContext, useState, useEffect, useRef } from 'react';
import { Input, Form, Table, Select, Image, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
// import EditableRow from './EditableRow';
// import EditableCell from './EditableCell';
import 'antd/dist/antd.css';
import './styles.css';
import Reuploaded from './Reuploaded';

const { Option } = Select;

export const EditableContext = React.createContext(null);

const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef();
  const form = useContext(EditableContext);
  useEffect(() => {
    if (editing) {
      inputRef.current.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({
      [dataIndex]: record[dataIndex],
    });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };

  const rules = () => {
    switch (dataIndex) {
      case "name":
        return [
          {
            required: true,
            message: `${title} is required.`,
          },
          {
            max: 50,
            message: `${title} must be minimum 50 characters.`,
          },
        ]
      case "sku":
        return [
          {
            required: true,
            message: `${title} is required.`,
          },
          {
            max: 20,
            message: `${title} must be minimum 20 characters.`,
          },
        ]
      default: return [];
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{
          margin: 0,
        }}
        name={dataIndex}
        rules={rules()}
      >
        <Input
          ref={inputRef}
          onPressEnter={save}
          onBlur={save} />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{
          paddingRight: 24,
        }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

const EditableTable = () => {
  const [products, setProducts] = useState([]);
  const [newUpdated, setNewUpdated] = useState([]);
  const [colors, setColors] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const columnsData = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: '5%',
    },
    {
      title: 'Error Description',
      dataIndex: 'errorDescription',
    },
    {
      title: 'Product Image',
      dataIndex: 'image',
      render: (_, record) => (
        <Image width={200} src={record.image} />
      )
    },
    {
      title: 'Product Name',
      dataIndex: 'name',
      editable: true,
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      editable: true,
    },
    {
      title: 'Color',
      dataIndex: 'color',
      render: (_text, row) => (
        <Select defaultValue="" style={{ width: 120 }} onChange={value => handleSave(row, value)}>
          {colors.map(color => (
            <Option key={color.id} value={color.name}>{color.name}</Option>
          ))}
        </Select>
      )
    },
  ];

  useEffect(() => {
    fetch('https://hiring-test.stag.tekoapis.net/api/products')
      .then(response => response.json())
      .then(products => setProducts(products)).catch(error => ({ error }));
    fetch('https://hiring-test.stag.tekoapis.net/api/colors')
      .then(response => response.json())
      .then(colors => setColors(colors)).catch(error => ({ error }));
  }, []);

  const handleSave = (row, value) => {
    const newProducts = [...products];
    const index = products.findIndex((item) => row.id === item.id);
    const item = newProducts[index];
    if (value) item.color = value;
    item.isChanged = true;
    newProducts.splice(index, 1, { ...item, ...row });
    setProducts(newProducts);
  };

  const handleSubmit = () => {
    setIsModalVisible(true);
    setNewUpdated(products.filter(product => product.isChanged === true));
  }

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  const columns = columnsData.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave: handleSave,
      }),
    };
  });
  return (
    <div>
      <Button
        icon={<UploadOutlined />}
        onClick={handleSubmit}
        type="primary"
        id="submit"
        style={{
          marginBottom: 16,
        }}
      >
        Submit
      </Button>
      <Table
        components={components}
        rowClassName={() => 'editable-row'}
        bordered
        dataSource={products}
        columns={columns}
        rowKey='id'
      />
      <Reuploaded products={newUpdated} isModalVisible={isModalVisible} setIsModalVisible={setIsModalVisible} />
    </div>
  );
}

export default EditableTable;
