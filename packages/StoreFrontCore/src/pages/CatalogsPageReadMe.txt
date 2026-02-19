****************************************************************************************************************************
    Infinite Scrolling
****************************************************************************************************************************

useEffect(() => {

    if (!lastItem || !hasMore || state.loading) return;

    const observer = new IntersectionObserver((entries) => {
  
    if (entries[0].isIntersecting) {
        setPage((prev) => prev + 1);
      }
    });

    observer.observe(lastItem);
    
    return () => observer.disconnect();
  
  }, [lastItem, hasMore, state.loading, page]);


IntersectionObserver is a browser API that allows you to asynchronously detect when an element
(in this case, lastItem) enters or leaves the viewport (or a specific ancestor container).

It's especially useful for:

Lazy-loading images

Triggering animations when elements come into view

Infinite scrolling 

Logging user engagement


The IntersectionObserver monitors the intersection between:

the target element (lastItem)

and the root (by default, the browser viewport)

Then, when the target enters or exits this area, the callback gets called incrementing the page number


New Page Loads
useEffect for data fetch runs (because page > 1)  
↓  
fetchCatalogs() → new items added to catalog list  
↓  
lastItem becomes the last of the new batch  
↓  
setLastItem(lastNode) → useEffect runs again  
↓  
New observer created → attaches to latest lastItem

If No More Data
newCatalogs.length < pageSize → setHasMore(false)  
↓  
hasMore now false → useEffect exits early  
↓  
No more observation → infinite scroll stops gracefully


****************************************************************************************************************************
    initial-load 
****************************************************************************************************************************

  useEffect(() => {

    // Flags that the component has finished mounting. 
    // This is used in other effects (Infinite Scrolling) to prevent unnecessary fetches.
    hasMounted.current = true;

    //Triggers a loading state in your global CatalogContext.
    dispatch({ type: 'LOADING' });

    // Starts an API call to load the first page of catalogs under the selected currentParentId.
    fetchCatalogs(1, pageSize, currentParentId)
      .then((res) => {

        const newCatalogs = res.data.catalogs || res.data;

       //If fewer than pageSize items are returned, there are no more pages.
        setHasMore(newCatalogs.length === pageSize);
       
       	// Ensures page state resets when changing to a new parent category.
        setPage(1);

        // Stores the catalog list in global state.
        dispatch({ type: 'FETCH_CATALOGS_SUCCESS', payload: newCatalogs });
      })
      	//Handles fetch failure gracefully.
      .catch((err) => dispatch({ type: 'ERROR', payload: err.message }));
  }, [currentParentId, dispatch]);


This useEffect is responsible for loading the first page of catalogs whenever the component mounts or the user navigates to a new catalog level.

This effect runs:

Initially on mount (when currentParentId is null)

Whenever the user navigates into a subcatalog (which updates currentParentId)

Not when page changes — that’s handled by the Infinite Scrolling useEffect

🧭 User clicks a subcatalog →
📌 currentParentId updates →
🔄 useEffect runs →
📦 Fetch page 1 of new subcatalogs →
🗂️ Replace catalog list in state →
🧵 lastItem updates for new list →
👁️ Observer reattaches for infinite scroll



****************************************************************************************************************************
   Core Engine Of Infinite Scrolling
****************************************************************************************************************************

  useEffect(() => {

    //Page 1 Is Skipped and is handled by the initial-load useEffect
    //This keeps logic clean and avoids duplicate fetching of page 1.
    if (page === 1 || !hasMounted.current) return;
    
    // Flags loading state in global context
    dispatch({ type: 'LOADING' });
    
    //Loads the next catalog page
    fetchCatalogs(page, pageSize, currentParentId)
      .then((res) => {
        const newCatalogs = res.data.catalogs || res.data;
        
        // Detects if more data is available
        setHasMore(newCatalogs.length === pageSize);
      
        //  Appends new catalogs to existing state
        dispatch({
          type: 'FETCH_CATALOGS_SUCCESS',
          payload: [...state.catalogs, ...newCatalogs],
        });
      })
      .catch((err) => dispatch({ type: 'ERROR', payload: err.message }));
  }, [page, currentParentId, dispatch]);


This useEffect runs every time page changes, after the initial mount:

Page is incremented by the InteInfinite Scrolling useEffect which triggers this useEffect to run and fetch more data

🔍 Observer sees lastItem in view
↓
🧠 setPage(prev => prev + 1)
↓
⏱️ useEffect sees new page value
↓
📞 fetchCatalogs(page, pageSize, currentParentId)
↓
📦 Append new data to state
↓
📍 setLastItem(new last item) → observer reattaches
↓
Repeat until hasMore === false
