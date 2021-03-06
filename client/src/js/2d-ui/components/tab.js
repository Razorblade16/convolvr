import React, { Component } from 'react';
import Button from './button';

const styles = {
  tab: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: '15px',
    display: 'inline-block',
    height: '60px',
    width: '60px'
  }
}

export default class Tab extends Component {
  render() {
    return (
        <div style={ Object.assign({}, styles.tab, this.props.style) } title={ this.props.title }
             onClick={ (evt) => { this.props.clickHandler(evt, this.props.title) } }
        >
            {(this.props.showTitle ? (
                <span>
                { this.props.title }
                </span>
            ) : "")}
            <Button title={this.props.title}
                    innerStyle={ this.props.buttonStyle }
                    image={this.props.image}
            />
        </div>
    )
  }
}

Tab.defaultProps = {
    title: "Menu Item",
    showTitle: false
}
