import React from 'react';
import { connect } from 'react-redux';
import cn from 'classnames';
import { Badge, Container, Row, Col } from 'reactstrap';
import Button from '../common/buttons/Button/Button';
import Categories from './Categories';
import ControlPanel from './ControlPanel';
import RightMenu from './RightMenu';
import { ROOT_CATEGORY_NODE_REF } from '../../constants/bpmn';
import { createCategory } from '../../actions/bpmn';
import { t } from '../../helpers/util';
import { showModelCreationForm, showImportModelForm } from '../../actions/bpmn';
import styles from './BPMNDesigner.module.scss';

const mapStateToProps = state => ({
  isReady: state.bpmn.isReady,
  totalModels: state.bpmn.models.length
});

const mapDispatchToProps = dispatch => ({
  createCategory: () => dispatch(createCategory({ parentId: ROOT_CATEGORY_NODE_REF })),
  showModelCreationForm: () => dispatch(showModelCreationForm()),
  showImportModelForm: () => dispatch(showImportModelForm())
});

const BPMNDesigner = ({ isReady, totalModels, createCategory, showModelCreationForm, showImportModelForm }) => {
  if (!isReady) {
    return null;
  }

  return (
    <Container>
      <Row>
        <Col xl={9} lg={8} md={12}>
          <div className={styles.header}>
            <p className={styles.counter}>
              {t('bpmn-designer.total')}
              <Badge color="primary" pill>
                {totalModels}
              </Badge>
            </p>
            <h2 className={styles.h2}>{t('bpmn-designer.process-models.header')}</h2>
          </div>
        </Col>
      </Row>
      <Row noGutters>
        <Col xl={3} lg={{ size: 4, order: 2 }} md={12}>
          <RightMenu />
        </Col>

        <Col xl={9} lg={8} md={12}>
          <div className={styles.whiteBlock}>
            <Button onClick={showModelCreationForm} className={cn('button_blue', styles.headerBtn)}>
              {t('bpmn-designer.create-model')}
            </Button>
            <Button onClick={showImportModelForm} className={styles.headerBtn}>
              {t('bpmn-designer.import-model')}
            </Button>
          </div>
          <ControlPanel />
          <Categories categoryId={ROOT_CATEGORY_NODE_REF} />
          <div className={styles.addCategoryBlock} onClick={createCategory}>
            {t('bpmn-designer.add-category')}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BPMNDesigner);
