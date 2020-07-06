import React from "react";
import { Link } from "react-router-dom";
import { gql } from "apollo-boost";
import { useQuery } from "@apollo/react-hooks";

import { Navigation } from "./components/Navigation";
import { Page, Content } from "./components/Page";
import { PackSection, PackImage } from "./components/Packs";
import {
  PackDiscoverPageQuery,
  PackDiscoverPageQuery_my,
  PackDiscoverPageQuery_featured,
} from "./__generated__/PackDiscoverPageQuery";

const PACKS_QUERY = gql`
  query PackDiscoverPageQuery($username: String) {
    featured: packs(first: 5) {
      edges {
        node {
          id
          name
          description
          imageUrl
        }
      }
    }
    my: packs(first: 10, username: $username) {
      edges {
        node {
          id
          name
          imageUrl
          description
        }
      }
    }
  }
`;

const Packs: React.FC<{
  packs?: PackDiscoverPageQuery_my | PackDiscoverPageQuery_featured | null;
}> = ({ packs }) => {
  return (
    <>
      {packs?.edges?.map((edge) => {
        const pack = edge?.node;
        if (!pack) return null;
        return (
          <Link key={pack.id} to={`/packs/${pack.id}`} className="pack-item">
            <PackImage src={pack.imageUrl} />
            <h4>{pack.name}</h4>
            <p>{pack.description}</p>
          </Link>
        );
      })}
    </>
  );
};

export const PackDiscoverPage = () => {
  const { data } = useQuery<PackDiscoverPageQuery>(PACKS_QUERY, {
    variables: { username: localStorage.getItem("username") || "" },
  });

  return (
    <Page>
      <Navigation />
      <Content>
        <PackSection>
          <div className="pack-section">
            <h2>Featured</h2>
            <div className="pack-items">
              <Packs packs={data?.featured} />
            </div>
          </div>
          {!!data?.my?.edges?.length && (
            <div className="pack-section">
              <h2>My Packs</h2>
              <div className="pack-items">
                <Packs packs={data?.my} />
              </div>
            </div>
          )}
        </PackSection>
      </Content>
    </Page>
  );
};