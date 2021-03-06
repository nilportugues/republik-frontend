import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { compose, graphql } from 'react-apollo'
import gql from 'graphql-tag'

import withT from '../../../lib/withT'
import { errorToString } from '../../../lib/utils/errors'
import { timeFormat } from '../../../lib/utils/format'
import { Link } from '../../../lib/routes'
import { Item as AccountItem, P } from '../Elements'

import TokenPackageLink from '../../Link/TokenPackage'

import {
  InlineSpinner, colors, linkRule, Interaction, A
} from '@project-r/styleguide'

const dayFormat = timeFormat('%d. %B %Y')

class Actions extends Component {
  constructor (...args) {
    super(...args)
    this.state = {
      isCancelling: false,
      values: {},
      dirty: {},
      errors: {}
    }
  }
  render () {
    const { t, membership, prolong, waitingMemberships } = this.props
    const {
      updating,
      remoteError
    } = this.state

    if (updating) {
      return <InlineSpinner />
    }

    return (
      <Fragment>
        {membership.active &&
          membership.renew &&
          membership.type.name === 'MONTHLY_ABO' &&
          <P>
            <Interaction.Cursive>
              {t.elements('memberships/MONTHLY_ABO/manage/upgrade/link', {
                buyLink: <Link route='pledge' params={{ package: 'ABO' }}>
                  <a {...linkRule}>
                    {t('memberships/MONTHLY_ABO/manage/upgrade/link/buyText')}
                  </a>
                </Link>
              })}
            </Interaction.Cursive>
          </P>}
        {!prolong && membership.active && membership.renew && waitingMemberships && <P>
          {t('memberships/manage/prolong/awaiting')}
        </P>}
        {membership.active && membership.renew && <P>
          <Link route='cancel' params={{ membershipId: membership.id }} passHref>
            <A>
              {t.first([
                `memberships/${membership.type.name}/manage/cancel/link`,
                'memberships/manage/cancel/link'
              ])}
            </A>
          </Link>
        </P>}
        {!membership.renew && !!membership.periods.length && <P>
          <A href='#reactivate' onClick={(e) => {
            e.preventDefault()
            this.setState({
              updating: true
            })
            this.props.reactivate({
              id: membership.id
            })
              .then(() => {
                this.setState({
                  updating: false,
                  remoteError: undefined
                })
              })
              .catch(error => {
                this.setState({
                  updating: false,
                  remoteError: errorToString(error)
                })
              })
          }}>
            {t.first([
              `memberships/${membership.type.name}/manage/reactivate`,
              'memberships/manage/reactivate'
            ])}
          </A>
        </P>}
        {prolong &&
          <P>
            <TokenPackageLink params={{
              package: 'PROLONG'
            }} passHref>
              <A>
                {t.first([
                  `memberships/${membership.type.name}/manage/prolong/link`,
                  'memberships/manage/prolong/link'
                ])}
              </A>
            </TokenPackageLink>
          </P>
        }
        {!!remoteError &&
          <P style={{ color: colors.error, marginTop: 10 }}>{remoteError}</P>}
      </Fragment>
    )
  }
}

const cancelMembership = gql`
mutation cancelMembership($id: ID!, $reason: String) {
  cancelMembership(id: $id, reason: $reason) {
    id
    active
    renew
  }
}
`

const reactivateMembership = gql`
mutation reactivateMembership($id: ID!) {
  reactivateMembership(id: $id) {
    id
    active
    renew
  }
}
`

const ManageActions = compose(
  withT,
  graphql(cancelMembership, {
    props: ({ mutate }) => ({
      cancel: (variables) =>
        mutate({ variables })
    })
  }),
  graphql(reactivateMembership, {
    props: ({ mutate }) => ({
      reactivate: (variables) =>
        mutate({ variables })
    })
  })
)(Actions)

const Manage = ({ t, membership, highlighted, prolong, waitingMemberships, title, compact, actions }) => {
  const createdAt = new Date(membership.createdAt)
  const latestPeriod = membership.periods[0]
  const formattedEndDate = latestPeriod && dayFormat(new Date(latestPeriod.endDate))

  return (
    <AccountItem
      compact={compact}
      highlighted={highlighted}
      createdAt={createdAt}
      title={
        title || t(
          `memberships/title/${membership.type.name}`,
          {
            sequenceNumber: membership.sequenceNumber
          }
        )
      }>
      {!!latestPeriod && <P>
        {membership.active && !membership.overdue && t.first(
          [
            `memberships/${membership.type.name}/latestPeriod/renew/${membership.renew}`,
            `memberships/latestPeriod/renew/${membership.renew}`
          ],
          { formattedEndDate },
          ''
        )}
        {membership.overdue && t(
          'memberships/latestPeriod/overdue',
          { formattedEndDate }
        )}
      </P>}
      {actions && <ManageActions membership={membership} prolong={prolong} waitingMemberships={waitingMemberships} />}
    </AccountItem>
  )
}

Manage.propTypes = {
  title: PropTypes.string,
  membership: PropTypes.object.isRequired,
  actions: PropTypes.bool.isRequired,
  prolong: PropTypes.bool
}

Manage.defaultProps = {
  actions: true
}

export default compose(
  withT
)(Manage)
