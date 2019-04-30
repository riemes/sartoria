import React, {Component} from 'react';
import axios from 'axios';
import Store from '../../store';
import {Modal, Input, Select, Button, Upload, Icon, message} from 'antd';
import TagCreator from './TagCreator';

const {TextArea} = Input;
const {Option} = Select;

class ItemCreator extends Component {
	state = {
		name: '',
    description: '',
    image: null,
    bin: undefined,
    tags: [],
    allBins: [],
    allTags: [],
    showTagCreator: false,
    loading: false,
    imagePreview: null
	}

  getAllBins = () => {
    const {store} = this.props;

    axios.get('/api/bins', {
      params: {
        owner: store.get('user').id
      }
    }).then(res => {
  		this.setState({ allBins: res.data });
  	});
  }

  getAllTags = () => {
    const {store} = this.props;

    axios.get('/api/tags', {
      params: {
        owner: store.get('user').id
      }
    }).then(res => {
  		this.setState({ allTags: res.data });
  	});
  }

  componentDidMount() {
    this.getAllBins()
    this.getAllTags()
  }

  renderBinOptions = () => this.state.allBins.map(bin => (
    <Option key={bin.id} value={bin.id}>{bin.name}</Option>
  ));

  renderTagOptions = () => this.state.allTags.map(tag => (
    <Option key={tag.id} value={tag.id}>{tag.name}</Option>
  ));

  getBase64 = (img, cb) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => cb(reader.result));
    reader.readAsDataURL(img);
  }

  handleUploaderChange = info => {
    if (info.file.status === 'uploading') {
      this.setState({ loading: true });
      return;
    }

    const image = info.file.originFileObj;
    if (info.file.status === 'done') {
      this.getBase64(image, imagePreview => this.setState({
        imagePreview,
        image,
        loading: false,
      }));
    }
  }

	handleOk = () => {
    const {name, description, image, bin, tags} = this.state;
    const {actions, store} = this.props;

		if (name.length === 0 || image == null || bin == null) {
			message.error('Name, image, and bin are required.');
			return;
		}

    const formData = new FormData();
    formData.append('owner', store.get('user').id);
		formData.append('name', name);
		formData.append('description', description);
    formData.append('image', image);
    formData.append('bin', bin);
    tags.forEach(tag => formData.append('tags', tag));

		axios.post('/api/items/', formData).then(res => {
			this.setState({
        name: '',
        description: '',
        image: null,
        bin: undefined,
        tags: [],
        imagePreview: null
			});

			actions.getAllItems();
			actions.hideItemCreator();
		});
	}

	render() {
    const {name, description, imagePreview, bin, tags, showTagCreator, loading} = this.state;
    const {visible, actions} = this.props;

		return (
			<Modal
				title='Add Item'
				visible={visible}
				onOk={this.handleOk}
				onCancel={actions.hideItemCreator}
				okText='Confirm'
			>
				<Input
					value={name}
					onChange={e => this.setState({ name: e.target.value })}
					placeholder='Name'
				/>
				<TextArea
					value={description}
          className='creator-field'
					onChange={e => this.setState({ description: e.target.value })}
					placeholder='Description'
				/>
        <Select
          className='creator-field creator-select'
          showSearch={true}
          placeholder='Bin'
          optionFilterProp='children'
          onChange={bin => this.setState({ bin })}
          value={bin}
        >
          {this.renderBinOptions()}
        </Select>
        <div className='creator-field'>
          <Select
            mode='multiple'
            className='creator-tag-select'
            placeholder='Tags'
            optionFilterProp='children'
            onChange={tags => this.setState({ tags })}
            value={tags}
          >
            {this.renderTagOptions()}
          </Select>
          <TagCreator
            placement='bottom'
            actions={{
              getAllTags: this.getAllTags,
              hideTagCreator: () => this.setState({ showTagCreator: false })
            }}
            visible={showTagCreator}
            handleVisibleChange={showTagCreator => this.setState({ showTagCreator })}
          >
            <Button icon='plus' className='creator-tag-add'>Tag</Button>
          </TagCreator>
        </div>
        <div className='creator-field'>
          <Upload
            className='creator-image'
            listType='picture-card'
            showUploadList={false}
            customRequest={({ file, onSuccess }) => {
              setTimeout(() => {
                onSuccess('ok');
              }, 0);
            }}
            accept='image/*'
            multiple={false}
            onChange={this.handleUploaderChange}
          >
            {imagePreview ?
              <img src={imagePreview} alt='' />
            : <div>
                <Icon type={loading ? 'loading' : 'plus'} />
              <div className='ant-upload-text'>Upload</div>
            </div>}
          </Upload>
        </div>
			</Modal>
		);
	}
}

export default Store.withStore(ItemCreator);
