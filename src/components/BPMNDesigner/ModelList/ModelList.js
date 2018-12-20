import React from 'react';
import { Col } from 'reactstrap';
import cn from 'classnames';
import { t } from '../../../helpers/util';
import styles from './ModelList.module.scss';

const ModelCard = ({ label, author, datetime, viewLink, editLink }) => {
  const dragNDropIconClasses = cn('icon-drag', styles.dndActionIcon);

  return (
    <Col xs={12} className={styles.itemWrapper}>
      <div className={styles.item}>
        <div className={styles.leftPart}>
          <p className={styles.label}>{label}</p>
          <p className={styles.authorAndDatetime}>
            <span className={styles.author}>{author}</span>
            <span className={styles.datetime}>{datetime}</span>
          </p>
        </div>

        <div className={styles.actions}>
          <a href={viewLink} className={styles.viewCard}>
            {t('bpmn.viewButton')}
          </a>
          <a href={editLink} className={styles.editActionIcon}>
            <span className={'icon-edit'} />
          </a>
          <span className={dragNDropIconClasses} />
        </div>
      </div>
    </Col>
  );
};

export default ModelCard;
