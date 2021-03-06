import React, { Component, Fragment } from 'react'
import { compose, graphql } from 'react-apollo'

import withT from '../../lib/withT'
import withMe from '../../lib/apollo/withMe'

import { timeFormat, chfFormat } from '../../lib/utils/format'
import track from '../../lib/piwik'
import { Link } from '../../lib/routes'

import List, { Item } from '../List'
import { Item as AccountItem } from './Elements'

import GiveMemberships from './Memberships/Give'

import query from './belongingsQuery'

import {
  RawHtml,
  linkRule
} from '@project-r/styleguide'

const dayFormat = timeFormat('%d. %B %Y')

class PledgeList extends Component {
  componentDidMount () {
    const { pledges } = this.props
    pledges.forEach(pledge => {
      pledge.options.forEach(option => {
        track([
          'addEcommerceItem',
          option.templateId, // (required) SKU: Product unique identifier
          option.reward ? option.reward.name : 'DONATE',
          // (optional) Product name
          undefined, // (optional) Product category
          option.price / 100, // (recommended) Product price
          option.amount // (optional, default to 1) Product quantity
        ])
      })
      track([
        'trackEcommerceOrder',
        pledge.id, // (required) Unique Order ID
        pledge.total / 100, // (required) Order Revenue grand total (includes tax, shipping, and subtracted discount)
        undefined, // (optional) Order sub total (excludes shipping)
        undefined, // (optional) Tax amount
        undefined, // (optional) Shipping amount
        pledge.donation < 0 // (optional) Discount offered (set to false for unspecified parameter)
      ])
    })
  }
  render () {
    const { pledges, t, highlightId, me } = this.props

    return <Fragment>
      {pledges.map(pledge => {
        const options = pledge.options.filter(option => (
          option.amount && option.minAmount !== option.maxAmount
        ))
        const createdAt = new Date(pledge.createdAt)

        return (
          <AccountItem key={pledge.id}
            highlighted={highlightId === pledge.id}
            title={t(`package/${pledge.package.name}/title`)}
            createdAt={createdAt}>
            <List>
              {!!options.length && options.map((option, i) => {
                const { membership, additionalPeriods } = option
                const isAboGive = membership && (membership.user.id !== me.id)
                const endDate = additionalPeriods &&
                  additionalPeriods.length &&
                  additionalPeriods[additionalPeriods.length - 1].endDate

                return (
                  <Item key={`option-${i}`}>
                    {option.maxAmount > 1 ? `${option.amount} ` : ''}
                    {t.first([
                      isAboGive && `pledge/option/${pledge.package.name}/${option.reward.name}/label/give`,
                      isAboGive && `option/${option.reward.name}/label/give`,
                      `pledge/option/${pledge.package.name}/${option.reward.name}/label/${option.amount}`,
                      `pledge/option/${pledge.package.name}/${option.reward.name}/label/other`,
                      `pledge/option/${pledge.package.name}/${option.reward.name}/label`,
                      `option/${option.reward.name}/label/${option.amount}`,
                      `option/${option.reward.name}/label/other`,
                      `option/${option.reward.name}/label`
                    ].filter(Boolean), {
                      count: option.amount,
                      name: option.membership && option.membership.user.name,
                      sequenceNumber: option.membership && option.membership.sequenceNumber,
                      endDateSuffix: endDate ? t('option/suffix/endDate', {
                        formattedEndDate: dayFormat(new Date(endDate))
                      }) : ''
                    })}
                  </Item>
                )
              })}
              {
                pledge.payments.map((payment, i) => (
                  <Item key={`payment-${i}`}>
                    {payment.method === 'PAYMENTSLIP' && payment.status === 'WAITING' && (
                      <span>
                        <RawHtml dangerouslySetInnerHTML={{
                          __html: t(`account/pledges/payment/PAYMENTSLIP/paperInvoice/${+(payment.paperInvoice)}`)
                        }} />
                        <br /><br />
                      </span>
                    )}
                    <RawHtml dangerouslySetInnerHTML={{
                      __html: t.first([
                        `account/pledges/payment/status/${payment.method}/${payment.status}`,
                        `account/pledges/payment/status/generic/${payment.status}`
                      ], {
                        formattedTotal: chfFormat(payment.total / 100),
                        hrid: payment.hrid,
                        method: t(`account/pledges/payment/method/${payment.method}`)
                      })
                    }} />
                  </Item>
                ))
              }
            </List>
            <GiveMemberships
              memberships={pledge.memberships}
              isGivePackage={pledge.package.name === 'ABO_GIVE'} />
          </AccountItem>
        )
      })}
      <div style={{ marginTop: 30 }}>
        <Link route='pledge' params={{ package: 'ABO_GIVE' }}>
          <a {...linkRule}>
            {t('account/pledges/ABO_GIVE/promo')}
          </a>
        </Link>
      </div>
    </Fragment>
  }
}

export default compose(
  withT,
  withMe,
  graphql(query, {
    props: ({ data }) => {
      return {
        loading: data.loading,
        error: data.error,
        pledges: (
          (
            !data.loading &&
            !data.error &&
            data.me &&
            data.me.pledges
          ) || []
        ).filter(pledge => pledge.status !== 'DRAFT')
      }
    }
  })
)(PledgeList)
