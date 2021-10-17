import 'antd/dist/antd.css';
import './styles.css';
import { Modal, Button, Image } from 'antd';

const Reuploaded = ({ products, isModalVisible, setIsModalVisible }) => {
  const handleOk = () => {
    setIsModalVisible(false);
  };

  return (
    <Modal
      title="Re-uploaded Products"
      visible={isModalVisible}
      footer={[
        <Button type="primary" onClick={handleOk}>OK</Button>
      ]}
    >
      {products.map(product => (
        <div key={product.id} class="modal-content">
          <div class="image">
            <Image
              width={100}
              src={product.image}
            />
          </div>
          <div class="info">
            <p>
              <b>{product.name}</b>
            </p>
            <p>
              <span>ID: </span>{product.id}
            </p>
            <p>
              <span>SKU: </span><span style={{color: 'red'}}>{product.sku}</span>
            </p>
            <p>
              <span>Color: </span>{product.color || "N/A"}
            </p>
          </div>
        </div>
      ))}
    </Modal>
  );
};

export default Reuploaded;
