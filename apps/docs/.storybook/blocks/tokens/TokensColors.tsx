import React from 'react'
import tokens from '@baloise/ds-tokens/dist/tokens.docs.json'
import {Clipboard} from '../Clipboard'

export const TokensColors = ({ overview }) => {
  const listBase = tokens.color.base
  const listAlias = tokens.color.alias

  const list = { ...listBase, ...listAlias }

  return (
    <table className="sb-unstyled my-x-large table tokens" style={{ width: '100%' }}>
      <thead>
        <tr>
          <th style={{ width: '100%' }}>Token & Description</th>
          <th style={{ minWidth: '100px' }}>Value</th>
          <th style={{ minWidth: '100px' }}></th>
        </tr>
      </thead>

      {Object.keys(list)
        .filter(key => key !== 'inverted')
        .map(key => {
          const item = list[key]
          const subItems = listBase[key]
          return (
            <tbody key={key}>
              <tr>
                <td style={{ verticalAlign: 'top' }} className="border-none">
                  <Clipboard label={item.name} value={`var(--${item.name})`}/>
                </td>
                <td style={{ verticalAlign: 'top' }} className="border-none">
                  <p className={`mt-none mb-x-small text-small font-weight-bold py-xx-small`}>{item.value}</p>
                </td>
                <td style={{ verticalAlign: 'top' }} className="border-none">
                  <div
                    className="radius-normal"
                    style={{ width: '48px', height: '48px', background: `var(--${item.name})` }}
                  ></div>
                </td>
              </tr>
              <tr>
                <td colSpan={3} className={subItems.value ? 'border-bottom-grey' : 'border-none'}>
                  <p className="m-none text-small mb-small">{item.comment}</p>
                </td>
              </tr>
              {!subItems.value ? (
                <tr>
                  <td colSpan={3} className="border-bottom-grey">
                    <p className="font-weight-bold mb-none">Shades</p>
                    <p className="inline-block mt-none text-small py-xx-small px-x-small bg-grey-2 radius-normal font-weight-bold">
                      {item.name}-x
                    </p>
                    <div className="flex gap-normal">
                      <div
                        className="radius-normal p-small font-weight-bold"
                        style={{ flex: '1', height: '48px', background: `var(--${item.name}-1)` }}
                      >
                        1
                      </div>
                      <div
                        className="radius-normal p-small font-weight-bold"
                        style={{ flex: '1', height: '48px', background: `var(--${item.name}-2)` }}
                      >
                        2
                      </div>
                      <div
                        className="radius-normal p-small font-weight-bold"
                        style={{ flex: '1', height: '48px', background: `var(--${item.name}-3)` }}
                      >
                        3
                      </div>
                      <div
                        className="radius-normal p-small font-weight-bold text-white"
                        style={{ flex: '1', height: '48px', background: `var(--${item.name}-4)` }}
                      >
                        4
                      </div>
                      <div
                        className="radius-normal p-small font-weight-bold text-white"
                        style={{ flex: '1', height: '48px', background: `var(--${item.name}-5)` }}
                      >
                        5
                      </div>
                      <div
                        className="radius-normal p-small font-weight-bold text-white"
                        style={{ flex: '1', height: '48px', background: `var(--${item.name}-6)` }}
                      >
                        6
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                ''
              )}
            </tbody>
          )
        })}
    </table>
  )
}
