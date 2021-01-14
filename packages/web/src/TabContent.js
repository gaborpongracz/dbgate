import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import tabs from './tabs';
import { useOpenedTabs } from './utility/globalState';
import ErrorBoundary from './utility/ErrorBoundary';

const TabContainer = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  visibility: ${(props) =>
    // @ts-ignore
    props.tabVisible ? 'visible' : 'hidden'};
`;

function createTabComponent(selectedTab) {
  const TabComponent = tabs[selectedTab.tabComponent];
  if (TabComponent) {
    return {
      TabComponent,
      props: selectedTab.props,
    };
  }
  return null;
}

export default function TabContent({ toolbarPortalRef }) {
  const files = useOpenedTabs();

  const [mountedTabs, setMountedTabs] = React.useState({});

  // cleanup closed tabs
  if (
    _.difference(
      _.keys(mountedTabs),
      _.map(
        files.filter((x) => x.closedTime == null),
        'tabid'
      )
    ).length > 0
  ) {
    setMountedTabs(_.pickBy(mountedTabs, (v, k) => files.find((x) => x.tabid == k && x.closedTime == null)));
  }

  const selectedTab = files.find((x) => x.selected);
  if (selectedTab) {
    const { tabid } = selectedTab;
    if (tabid && !mountedTabs[tabid])
      setMountedTabs({
        ...mountedTabs,
        [tabid]: createTabComponent(selectedTab),
      });
  }

  return _.keys(mountedTabs).map((tabid) => {
    const { TabComponent, props } = mountedTabs[tabid];
    const tabVisible = tabid == (selectedTab && selectedTab.tabid);
    return (
      // @ts-ignore
      <TabContainer key={tabid} tabVisible={tabVisible}>
        <ErrorBoundary>
          <TabComponent {...props} tabid={tabid} tabVisible={tabVisible} toolbarPortalRef={toolbarPortalRef} />
        </ErrorBoundary>
      </TabContainer>
    );
  });
}
