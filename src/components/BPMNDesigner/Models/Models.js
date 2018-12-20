import React from 'react';
import { connect } from 'react-redux';
import { Row } from 'reactstrap';
import { ViewTypeList } from '../../../constants/bpmn';
import ModelCard from '../ModelCard';
import ModelList from '../ModelList';

const mapStateToProps = state => ({
  viewType: state.bpmn.viewType
});

const Models = ({ viewType, items }) => {
  const ModelComponent = viewType === ViewTypeList ? ModelList : ModelCard;

  const models = [];
  if (items) {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const itemId = item.id || i;
      models.push(<ModelComponent key={itemId} label={item.label} author={item.author} datetime={item.datetime} image={item.image} />);
    }
  }

  return <Row noGutters>{models}</Row>;
};

export default connect(mapStateToProps)(Models);
