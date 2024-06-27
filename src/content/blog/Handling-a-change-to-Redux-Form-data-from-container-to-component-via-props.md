---
title: Handling a change to Redux-Form data from container to component via props
featured: false
draft: false
author: Rachel Cantor
pubDatetime: 2017-11-07T05:00:00.000Z
tags:
  - React
  - Redux
---

I ended up realizing that I didn’t need to [use context for this](https://blog.hellopico.io/passing-a-redux-form-action-creator-from-container-to-component-via-react-context-7563169746f7) after all and used this pattern as an alternative.

```javascript
import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { FieldArray, getFormValues } from 'redux-form' // import the action creator you need
import CountryPicker from '../components/CountryPicker'

class CountriesContainer extends Component {

  constructor(props) {
    super(props)
    this.state = { countries: props.formValues.countries }
  }

  static propTypes = {
    formValues: PropTypes.object
  }

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.formValues && nextProps.formValues.countries !== this.props.formValues.countries) {
      this.setState({ countries: nextProps.formValues.countries })
    }
  }

  shouldComponentUpdate = (nextProps) => {
    if (nextProps.formValues) return (nextProps.formValues.countries !== this.props.formValues.countries)
  }

  handleCountryChange = () => this.setState({ countries: this.props.formValues.countries })

  render() {
    const { countries } = this.state
    const options = ['United States', 'Canada', 'Mexico']

    return (
      <div>
        <FieldArray component={CountryPicker}
          name='countries'
          options={options}
          selectedCountries={countries}
          onCountryChange={this.handleCountryChange}
        />
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  const { countries } = state
  return {
    countries,
    formValues: getFormValues('countriesForm')(state)
  }
}
export default connect(
  mapStateToProps
)(CountriesContainer)
```

```javascript
import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { List, Checkbox, Table } from 'semantic-ui-react'
import indexOf from 'lodash/indexOf'

class CountryPicker extends Component {
  constructor(props) {
    super(props)
    this.state = {
      options: props.options,
      selected: props.selectedCountries,
      fields: props.fields
    }
    this.handleCountryChange = this.handleCountryChange.bind(this)
  }

  static propTypes = {
    options: PropTypes.array.isRequired,
    selectedCountries: PropTypes.array.isRequired,
    fields: PropTypes.any,
    onCountryChange: PropTypes.func.isRequired
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.selectedCountries !== this.props.selectedCountries) {
      this.handleCountryChange()
      return true
    }
    return false
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      selected: nextProps.selectedCountries
    })
  }

  handleCountryChange() {
    this.props.onCountryChange(this.state.regionKey)
  }

  handleSelectAll = () => {
    const { options, selected, fields } = this.state
    let fieldsToAdd, fieldsToRemove
    if (selected.length === options.length) {
      // deselect all
      fieldsToRemove = selected.map((country) => indexOf(selected, country))

      // Making sure the removal of indices won't be affected by race conditions
      // by sorting them in descending order
      fieldsToRemove.sort((a, b) => b - a)
      fieldsToRemove.forEach((countryIndex) => fields.remove(countryIndex))
    } else {
      fieldsToAdd = options.reduce((result, country) => {
        if (indexOf(selected, country) === -1) result.push(country)
        return result
      }, [])
      fieldsToAdd.forEach((country) => fields.push(country))
    }
  }

  handleChange = (e, { value }) => {
    const { selected, fields } = this.state
    if (indexOf(selected, value) !== -1) {
      fields.remove(indexOf(selected, value))
    } else {
      fields.push(value)
    }
  }

  render() {
    const { options, selected } = this.state
    return (
      <Table compact>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>
              <Checkbox checked={options.length > 0 && selected.length === options.length} label='Countries'
                indeterminate={0 !== selected.length && selected.length < options.length} onChange={this.handleSelectAll} onClick={this.handleSelectAll}
                disabled={options.length === 0} />
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>
              <List verticalAlign='middle' relaxed style={{ height: '180px', overflowY: 'auto' }}>
                {options.map((country, i) =>
                  <List.Item key={i}>
                    <List.Content>
                      <Checkbox label={country} name='countries' value={country} checked={indexOf(selected, country) !== -1} onChange={this.handleChange} />
                    </List.Content>
                  </List.Item>
                )}
              </List>
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    )
  }
}

export default CountryPicker
```
