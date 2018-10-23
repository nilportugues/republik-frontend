import React, { Component } from 'react'
import { withRouter } from 'next/router'
import { compose } from 'react-apollo'
import { css } from 'glamor'
import ChevronRightIcon from 'react-icons/lib/md/chevron-right'

import {
  NarrowContainer, Interaction, fontFamilies, mediaQueries, colors
} from '@project-r/styleguide'

import { A } from '../components/Account/Elements'
import { CDN_FRONTEND_BASE_URL } from '../lib/constants'
import { Link } from '../lib/routes'
import { prefixHover } from '../lib/utils/hover'
import Frame from '../components/Frame'
import withT from '../lib/withT'

const { H1, P } = Interaction

const styles = {
  title: css({
    fontFamily: fontFamilies.sansSerifRegular,
    fontSize: 19,
    lineHeight: '28px',
    marginBottom: 15
  }),
  packageHeader: css({
    position: 'relative'
  }),
  package: css({
    display: 'block',
    textDecoration: 'none',
    color: '#000',
    marginTop: -1,
    fontFamily: fontFamilies.sansSerifRegular,
    paddingTop: 7,
    paddingBottom: 9,
    [mediaQueries.mUp]: {
      paddingTop: 15,
      paddingBottom: 21
    },
    borderBottom: `1px solid ${colors.divider}`,
    borderTop: `1px solid ${colors.divider}`
  }),
  packageHighlighted: css({
    position: 'relative',
    zIndex: 1,
    // marginTop: -1,
    marginBottom: -1,
    marginLeft: -10,
    marginRight: -10,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 8,
    paddingBottom: 10,
    [mediaQueries.mUp]: {
      paddingTop: 16,
      paddingBottom: 22
    },
    width: 'calc(100% + 20px)',
    backgroundColor: colors.primaryBg,
    borderBottom: 'none',
    borderTop: 'none'
  }),
  packageTitle: css({
    fontFamily: fontFamilies.sansSerifMedium,
    fontSize: 16,
    lineHeight: '24px',
    [mediaQueries.mUp]: {
      fontSize: 22,
      lineHeight: '30px'
    }
  }),
  packagePrice: css({
    marginTop: 0,
    color: colors.primary,
    fontSize: 16,
    lineHeight: '24px',
    [mediaQueries.mUp]: {
      fontSize: 22,
      lineHeight: '30px'
    }
  }),
  packageIcon: css({
    position: 'absolute',
    right: 0,
    top: '50%',
    marginTop: '-10px'
  }),
  packageContent: css({
    fontSize: 17,
    lineHeight: '25px'
  }),
  buffer: css({
    // catch negative margin from last package
    marginTop: -1,
    marginBottom: 20
  }),
  links: css({
    lineHeight: '24px',
    marginTop: 13,
    fontSize: 16,
    '& a': {
      color: colors.text,
      cursor: 'pointer',
      textDecoration: 'underline'
    },
    [`& ${prefixHover()}`]: {
      color: colors.secondary
    },
    '& a:focus': {
      color: colors.secondary
    },
    '& a:active': {
      color: colors.primary
    }
  }),

  pledgeContainer: css({
    height: '150px',
    backgroundColor: colors.primaryBg
  })
}

class ProlongPage extends Component {
  render () {
    const meta = {
      title: 'Abonnement verlängern',
      description: 'Verlängern Sie Ihr Abonnement',
      image: `${CDN_FRONTEND_BASE_URL}/static/social-media/logo.png`
    }

    return (
      <Frame meta={meta}>
        <NarrowContainer>
          <H1 style={{ marginBottom: 40 }}>Verlängern</H1>
          <P>Ihr Produkt, dass Sie verlängern möchten:</P>
          <div style={{ marginTop: 20, marginBottom: 40 }}>
            <div {...styles.pledgeContainer}>
              (Platzhalter für eine most beautiful Pledge/Membership Komponente)
            </div>
            <Link route='account'>
              <A href=''>Ein anderes Produkt verlängern</A>
            </Link>
          </div>
          <P>Wir können Ihnen folgende Möglichkeiten anbieten:</P>
          <div style={{ marginTop: 20, marginBottom: 40 }}>
            <Link>
              <a {...styles.package}>
                <div {...styles.packageHeader}>
                  <div {...styles.packageTitle}>
                    Abo und Mitgliedschaft für ein weiteres Jahr
                  </div>
                  <span style={{ backgroundColor: colors.discrete[1] }}>
                    Test
                  </span>
                  <div {...styles.packagePrice}>
                    CHF 240
                  </div>
                  <div {...styles.packageContent}>
                    <P>
                      Mitgliedschaft für 1 Jahr und 34 Tage (Bonus)
                    </P>
                  </div>
                  <span {...styles.packageIcon}>
                    <ChevronRightIcon size={24} />
                  </span>
                </div>
              </a>
            </Link>
            <Link>
              <a {...styles.package}>
                <div {...styles.packageHeader}>
                  <div {...styles.packageTitle}>
                    Abo und Mitgliedschaft für ein weiteres Jahr
                  </div>
                  <div {...styles.packagePrice}>
                    CHF 240
                  </div>
                  <div {...styles.packageContent}>
                    <P>
                      Mitgliedschaft für 1 Jahr
                    </P>
                  </div>
                  <span {...styles.packageIcon}>
                    <ChevronRightIcon size={24} />
                  </span>
                </div>
              </a>
            </Link>

            <Link>
              <a {...styles.package}>
                <div {...styles.packageHeader}>
                  <div {...styles.packageTitle}>
                    Gönner-Mitgliedschaft
                  </div>
                  <div {...styles.packagePrice}>
                    CHF 1000 pro Jahr
                  </div>
                  <div {...styles.packageContent}>
                    <P>
                      Mitgliedschaft für 1 Jahr
                      Goodies und Schmuh.
                    </P>
                  </div>
                  <span {...styles.packageIcon}>
                    <ChevronRightIcon size={24} />
                  </span>
                </div>
              </a>
            </Link>
          </div>

          <div style={{ marginTop: 20, marginBottom: 40 }}>
            <A href='#'>
              Sie können sich den Betrag nicht leisten? Klicken Sie hier
            </A>
            <br />
            <A href='#'>
              Sehen Sie sich Ihre Abonnements und Einkäufe hier an
            </A>
          </div>
        </NarrowContainer>
      </Frame>
    )
  }
}

export default compose(
  withT,
  withRouter
)(ProlongPage)
