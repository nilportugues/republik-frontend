import React, { Fragment, Component } from 'react'
import { compose, graphql } from 'react-apollo'
import { max } from 'd3-array'
import { css } from 'glamor'

import withT from '../../lib/withT'
import withMe from '../../lib/apollo/withMe'
import withInNativeApp from '../../lib/withInNativeApp'

import { Content, MainContainer } from '../Frame'
import Loader from '../Loader'
import UserGuidance from './UserGuidance'
import UpdateMe from './UpdateMe'
import UpdateEmail from './UpdateEmail'

import Anchors from './Anchors'
import AccessGrants from './Access/Grants'
import AccessCampaigns from './Access/Campaigns'
import AuthSettings from './AuthSettings'
import NewsletterSubscriptions from './NewsletterSubscriptions'
import NotificationOptions from './NotificationOptions'
import PledgeList from './PledgeList'
import SignIn from '../Auth/SignIn'
import GiveStatement from '../Testimonial/GiveStatement'
import Box from '../Frame/Box'

import {
  H1, Interaction, mediaQueries
} from '@project-r/styleguide'

import query from './belongingsQuery'

import MembershipList from './Memberships/List'
import PaymentSources from './PaymentSources'

import { APP_OPTIONS } from '../../lib/constants'

import { HEADER_HEIGHT_MOBILE, HEADER_HEIGHT } from '../constants'

const { H2, P } = Interaction

const styles = {
  accountAnchor: css({
    display: 'block',
    visibility: 'hidden',
    position: 'relative',
    top: -(HEADER_HEIGHT_MOBILE + 20),
    [mediaQueries.mUp]: {
      top: -(HEADER_HEIGHT + 20)
    }
  })
}

const AccountAnchor = ({ children, id }) => {
  return (
    <div style={{ marginBottom: 80 }}>
      <a {...styles.accountAnchor} id={id} />
      {children}
    </div>
  )
}

class Account extends Component {
  componentDidMount () {
    if (window.location.hash.substr(1).length > 0) {
      const node = document.getElementById(window.location.hash.substr(1))

      if (node) {
        node.scrollIntoView()
      }
    }
  }

  render () {
    const { loading, error, me, t, query, hasMemberships, hasActiveMemberships, hasAccessGrants, acceptedStatue, recurringAmount, hasPledges, hasProlongPledge, merci, inNativeIOSApp } = this.props

    return <Loader
      loading={loading}
      error={error}
      render={() => {
        if (!me) {
          return (
            <MainContainer>
              <Content>
                <H1>{t('account/signedOut/title')}</H1>
                <P>
                  {t('account/signedOut/signIn')}
                </P>
                <SignIn email={query.email} />
              </Content>
            </MainContainer>
          )
        }

        return (
          <Fragment>
            {hasAccessGrants && !hasActiveMemberships && <AccessGrants />}
            {!hasAccessGrants && !hasMemberships && !inNativeIOSApp && <UserGuidance />}
            <MainContainer>
              <Content>
                {!merci && <H1>
                  {t('Account/title', {
                    nameOrEmail: me.name || me.email
                  })}
                </H1>}
                <Anchors />
                {hasMemberships && inNativeIOSApp &&
                <Box style={{ padding: 14, marginBottom: 20 }}>
                  <P>
                    {t('account/ios/box')}
                  </P>
                </Box>
                }
                {hasPledges && <AccountAnchor id='statement'>
                  <GiveStatement pkg={hasProlongPledge ? 'PROLONG' : undefined} />
                </AccountAnchor>}
                {!inNativeIOSApp &&
                  <AccountAnchor id='abos'>
                    <MembershipList highlightId={query.id} />
                    {recurringAmount > 0 &&
                    <PaymentSources query={query} total={recurringAmount} />
                    }
                  </AccountAnchor>
                }

                <AccountAnchor id='teilen'>
                  <AccessCampaigns />
                </AccountAnchor>

                <AccountAnchor id='email'>
                  <UpdateEmail />
                </AccountAnchor>

                <AccountAnchor id='account'>
                  <UpdateMe acceptedStatue={acceptedStatue} hasMemberships={hasMemberships} />
                </AccountAnchor>

                {!inNativeIOSApp &&
                  <AccountAnchor id='pledges'>
                    {(hasPledges || !hasMemberships) && (
                      <H2>{t('account/pledges/title')}</H2>
                    )}
                    <PledgeList highlightId={query.id} />
                  </AccountAnchor>
                }

                <AccountAnchor id='newsletter'>
                  <H2>{t('account/newsletterSubscriptions/title')}</H2>
                  <NewsletterSubscriptions />
                </AccountAnchor>

                <AccountAnchor id='benachrichtigungen'>
                  <H2>{t('account/notificationOptions/title')}</H2>
                  <NotificationOptions />
                </AccountAnchor>

                {APP_OPTIONS && <AccountAnchor id='anmeldung'>
                  <H2>{t('account/authSettings/title')}</H2>
                  <AuthSettings />
                </AccountAnchor>}
              </Content>
            </MainContainer>
          </Fragment>
        )
      }}
    />
  }
}
export default compose(
  withMe,
  withT,
  withInNativeApp,
  graphql(query, {
    props: ({ data }) => {
      const isReady = (
        !data.loading &&
        !data.error &&
        data.me
      )
      const hasMemberships = (
        isReady &&
        data.me.memberships &&
        !!data.me.memberships.length
      )
      const hasActiveMemberships = (
        isReady &&
        hasMemberships &&
        data.me.memberships.some(m => m.active)
      )
      const hasPledges = (
        isReady &&
        data.me.pledges &&
        !!data.me.pledges.length
      )
      const hasAccessGrants = (
        isReady &&
        data.me.accessGrants &&
        !!data.me.accessGrants.length
      )
      return {
        loading: data.loading,
        error: data.error,
        hasPledges,
        hasProlongPledge: hasPledges && !!data.me.pledges.find(pledge => (
          pledge.package.name === 'PROLONG'
        )),
        acceptedStatue: (
          hasPledges &&
          !!data.me.pledges.find(pledge => (
            pledge.package.name !== 'MONTHLY_ABO' &&
            pledge.package.name !== 'DONATE'
          ))
        ),
        hasMemberships,
        hasActiveMemberships,
        memberships: hasMemberships && data.me.memberships,
        hasAccessGrants,
        recurringAmount: hasMemberships
          ? max(
            data.me.memberships.map(m => {
              const recurringOptions = m.pledge.options
                .filter(o => o.reward && o.reward.name === 'MONTHLY_ABO')
              return max(recurringOptions.map(o => o.price)) || 0
            })
          )
          : 0
      }
    }
  })
)(Account)
