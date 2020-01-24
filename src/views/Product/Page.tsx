import { smallScreen } from "../../globalStyles/scss/variables.scss";

import classNames from "classnames";
import * as React from "react";
import Media from "react-media";

import { RichTextContent } from "@components/atoms";
import { CachedImage, Thumbnail } from "@components/molecules";

import { Breadcrumbs, ProductDescription } from "../../components";
import { CartContext } from "../../components/CartProvider/context";
import { generateCategoryUrl, generateProductUrl } from "../../core/utils";
import GalleryCarousel from "./GalleryCarousel";
import OtherProducts from "./Other";
import { ProductDetails_product } from "./types/ProductDetails";

import { structuredData } from "../../core/SEO/Product/structuredData";

class Page extends React.PureComponent<{ product: ProductDetails_product }> {
  fixedElement: React.RefObject<HTMLDivElement> = React.createRef();
  productGallery: React.RefObject<HTMLDivElement> = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      variantId: "",
    };
  }

  setVariantId = (id: string) => {
    console.log("SET VARIANT ID has been called", id);
    this.setState({ variantId: id });
  };

  get showCarousel() {
    return this.props.product.images.length > 1;
  }

  populateBreadcrumbs = product => [
    {
      link: generateCategoryUrl(product.category.id, product.category.name),
      value: product.category.name,
    },
    {
      link: generateProductUrl(product.id, product.name),
      value: product.name,
    },
  ];

  componentDidMount() {
    if (this.showCarousel) {
      window.addEventListener("scroll", this.handleScroll, {
        passive: true,
      });
    }
  }

  componentWillUnmount() {
    if (this.showCarousel) {
      window.removeEventListener("scroll", this.handleScroll);
    }
  }

  handleScroll = () => {
    const productGallery = this.productGallery.current;
    const fixedElement = this.fixedElement.current;

    if (productGallery && fixedElement) {
      const containerPostion =
        window.innerHeight - productGallery.getBoundingClientRect().bottom;
      const fixedPosition =
        window.innerHeight - fixedElement.getBoundingClientRect().bottom;
      const fixedToTop = Math.floor(fixedElement.getBoundingClientRect().top);
      const galleryToTop = Math.floor(
        this.productGallery.current.getBoundingClientRect().top + window.scrollY
      );

      if (containerPostion >= fixedPosition && fixedToTop <= galleryToTop) {
        fixedElement.classList.remove("product-page__product__info--fixed");
        fixedElement.classList.add("product-page__product__info--absolute");
      } else {
        fixedElement.classList.remove("product-page__product__info--absolute");
        fixedElement.classList.add("product-page__product__info--fixed");
      }
    }
  };

  getImages = () => {
    const { product } = this.props;
    if (product.variants && this.state.variantId) {
      const variant = product.variants
        .filter(variant => variant.id === this.state.variantId)
        .pop();
      return variant.images;
    } else {
      return product.images;
    }
  };

  renderImages = product => {
    const images = this.getImages();
    if (images && images.length) {
      return images.map(image => (
        <a href={image.url || image.url2x} target="_blank">
          <CachedImage url={image.url} key={image.id}>
            <Thumbnail source={product} />
          </CachedImage>
        </a>
      ));
    }
    return <CachedImage />;
  };

  render() {
    const { product } = this.props;
    console.log(this.getImages());

    const cartContextConsumer = (
      <CartContext.Consumer>
        {cart => (
          <ProductDescription
            name={product.name}
            productVariants={product.variants}
            selectedAttributes={product.attributes}
            pricing={product.pricing}
            addToCart={cart.add}
            setVariantId={this.setVariantId}
          >
            <RichTextContent descriptionJson={product.descriptionJson} />
          </ProductDescription>
        )}
      </CartContext.Consumer>
    );
    return (
      <div className="product-page">
        <div className="container">
          <Breadcrumbs breadcrumbs={this.populateBreadcrumbs(product)} />
        </div>
        <div className="container">
          <div className="product-page__product">
            {/* Add script here */}
            <script className="structured-data-list" type="application/ld+json">
              {structuredData(product)}
            </script>

            {/*  */}
            <Media query={{ maxWidth: smallScreen }}>
              {matches =>
                matches ? (
                  <>
                    <GalleryCarousel images={this.getImages()} />
                    <div className="product-page__product__info">
                      {cartContextConsumer}
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      className="product-page__product__gallery"
                      ref={this.productGallery}
                    >
                      {this.renderImages(product)}
                    </div>
                    <div className="product-page__product__info">
                      <div
                        className={classNames({
                          ["product-page__product__info--fixed"]: true,
                        })}
                      >
                        {cartContextConsumer}
                      </div>
                    </div>
                  </>
                )
              }
            </Media>
          </div>
        </div>
        <OtherProducts products={product.category.products.edges} />
      </div>
    );
  }
}

export default Page;
