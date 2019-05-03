import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {Card, Icon} from 'antd';
import ItemTag from './ItemTag';

const {Meta} = Card;

class ItemCard extends Component {
  renderTags = () => this.props.data.tags.map(tag => (
    <ItemTag key={tag.id} className='sub' data={tag} />
  ));

  renderActions = () => {
    const {data, showBin} = this.props;

    const GoToBin = ({id}) => (<Link to={`/bins/${id}`}><Icon type='dropbox' /></Link>);
    const GoToItem = ({id}) => (<Link to={`/items/${id}`}><Icon type='skin' /></Link>);

    if (showBin) {
      return [<GoToItem id={data.id} />, <GoToBin id={data.bin.id}/>];
    } else {
      return [<GoToItem id={data.id} />];
    }
  }

  render() {
    const {data, showBin} = this.props;

    return (
      <Card
        className='item'
        hoverable={true}
        cover={<img alt='' src={data.image} />}
        actions={this.renderActions()}
      >
        <Meta
          title={<span><Icon type='skin' className='label' />{data.name}</span>}
          description={
            <div>
              {showBin && <div><Icon type='dropbox' className='label' />{data.bin.name}</div>}
              {data.tags.length !== 0 && <div><Icon type='tags' className='label' />{this.renderTags()}</div>}
            </div>
          }
        />
      </Card>
    );
  }
}

export default ItemCard;
