// import * as React from "react";
import NextLink from "next/link";
import { Button, Table, Badge } from 'react-bootstrap';
import Image from 'react-bootstrap/Image'
import React, { useState } from 'react'
import { QueryClient, useQuery } from "react-query";
import { dehydrate } from "react-query/hydration";
type Price = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  total_volume: number;
  market_cap: number;
};

type PageProps = {
  initialPrice: Price[];
};

const getMarket = async (page = 1) => {
  const URL = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=idr&per_page=10&page=${page}`;
  const response = await fetch(URL);
  if (!response.ok) {
    throw new Error("Fetching Error");
  }
  return await response.json();
};

const formatNumber = (num: number) => {
  return Intl.NumberFormat("id-Id").format(num);
};

const Percentage = ({ percent }: { percent: number }) => {
  const formatPercent = Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(percent / 100);

  let color = "black";
  if (percent > 0) {
    color = "green.500";
  } else if (percent < 0) {
    color = "red.500";
  }

  return <p>{formatPercent}</p>;
};

// SSR with initial Data
// export async function getStaticProps() {
//   const initialPrice = await getMarket();
//   return { props: { initialPrice } };
// }

// SSR with Hydrate
export async function getStaticProps() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(["market", 1], () => getMarket());

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
}

function App() {
  const [page, setPage] = useState(1);
  const nextPage = () => {
    setPage((old) => old + 1);
  };
  const previousPage = () => {
    setPage((old) => old - 1);
  };
  const { data, isError, isLoading, isFetching, isSuccess } = useQuery(
    ["market", page],
    () => getMarket(page),
    {
      staleTime: 3000, // ms
      refetchInterval: 3000,
      // initialData: initialPrice,
    }
  );
  return (
    <div>
      <div className="header">
        <h2>Coin Market - React Query</h2>
      </div>
      <div className="coin-table">
      {/* {isFetching && (
        <p>fetching</p>
      )} */}
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Coin</th>
              <th>Last Price</th>
              <th>24h % Change</th>
              <th>Total Volume</th>
              <th>Market Cap</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <p>Loading...</p>}
            {isError && <p>There was an error processing your request</p>}
            {isSuccess &&
              data?.map((price: Price) => (
                <tr>
                  <td className="coin-item">
                    <div className="flex">
                      <Image
                        className="coin-image"
                        src={price.image}
                      />

                      <h4 className="my-auto coin-id">
                        {price.id}
                      </h4>
                      <Badge className="my-auto">
                        <h5 className="coin-symbol">{price.symbol}</h5>
                      </Badge>
                    </div>
                  </td>
                  <td>{formatNumber(price.current_price)}</td>
                  <td>
                    <Percentage percent={price.price_change_percentage_24h} />
                  </td>
                  <td>{formatNumber(price.total_volume)}</td>
                  <td>{formatNumber(price.market_cap)}</td>
                </tr>
              ))}
          </tbody>
        </Table>
        <div className="pagination">
          <div className="pagination-item">
            <Button
              variant="primary"
              size="sm"
              onClick={previousPage}
              disabled={page === 1 ? true : false}
            >
              <h5>Previous</h5>
            </Button>
            <h5 className="page">{page}</h5>
            <Button
              variant="primary"
              size="sm"
              onClick={nextPage}
            >
              <h5>Next</h5>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App